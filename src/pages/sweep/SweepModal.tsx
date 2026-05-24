import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Phone, Monitor, Globe, Smartphone, CheckCircle, Clock, AlertTriangle,
  CalendarClock, RotateCcw, XCircle, Timer, Loader2, Bot, ArrowRight,
  Shield, FileText, MessageSquare, Zap
} from 'lucide-react';
import type { ClaimCheckEntry } from '../../data/types';

// ─── Per-TPA Access Methods ───
const TPA_ACCESS: Record<string, { method: 'hotline' | 'portal' | 'api' | 'app'; url: string; icon: typeof Phone }> = {
  MiCare: { method: 'hotline', url: '1-800-88-MICARE', icon: Phone },
  MediExpress: { method: 'portal', url: 'mediexpress.com.my/provider', icon: Monitor },
  IHP: { method: 'portal', url: 'portal.ihp.com.my/claims', icon: Monitor },
  PMCare: { method: 'app', url: 'PMCare Provider App v3.2', icon: Smartphone },
  SelCare: { method: 'api', url: 'api.selcare.com.my/v2/claims', icon: Globe },
  'PeKa B40': { method: 'api', url: 'api.pekab40.gov.my/v1/status', icon: Globe },
};

// ─── Detailed step scripts per claim ───
type AgentStep = {
  agent: string;
  action: string;
  detail: string;
  type: 'init' | 'connect' | 'navigate' | 'input' | 'waiting' | 'response' | 'decision' | 'log';
  durationMs: number;
};

function generateSteps(claim: ClaimCheckEntry, outcome: string, response: string, cooldown: number): AgentStep[] {
  const access = TPA_ACCESS[claim.tpaName] ?? { method: 'portal', url: `${claim.tpaName.toLowerCase()}.com.my`, icon: Monitor };
  const method = access.method;
  const maskedIc = claim.patientName.split(' ')[0].slice(0, 3) + '***';
  const steps: AgentStep[] = [];

  // 1. Orchestrator picks up claim
  steps.push({ agent: 'OrchestratorAgent', action: 'Selecting claim from queue', detail: `${claim.claimNo} \u2022 ${claim.patientName} \u2022 ${claim.tpaName} \u2022 RM ${claim.grossAmountRm} \u2022 ${claim.daysOutstanding}d outstanding`, type: 'init', durationMs: 600 });
  steps.push({ agent: 'OrchestratorAgent', action: 'Routing to StatusAgent', detail: `Connector: ${method.toUpperCase()} \u2022 Endpoint: ${access.url}`, type: 'init', durationMs: 400 });

  // 2. StatusAgent connects
  if (method === 'hotline') {
    steps.push({ agent: 'StatusAgent', action: `Dialing ${access.url}`, detail: 'Initiating IVR call...', type: 'connect', durationMs: 900 });
    steps.push({ agent: 'StatusAgent', action: 'IVR Navigation', detail: 'Press 1 for Claims Status \u2192 Press 2 for Existing Claims', type: 'navigate', durationMs: 700 });
    steps.push({ agent: 'StatusAgent', action: 'Entering claim reference', detail: `Ref: ${claim.claimNo} \u2022 IC: ${maskedIc}`, type: 'input', durationMs: 800 });
    steps.push({ agent: 'StatusAgent', action: 'Waiting for operator response', detail: 'On hold... call duration 0:42', type: 'waiting', durationMs: 1200 });
  } else if (method === 'portal') {
    steps.push({ agent: 'StatusAgent', action: `Opening ${access.url}`, detail: 'Loading portal login page...', type: 'connect', durationMs: 700 });
    steps.push({ agent: 'StatusAgent', action: 'Authenticating', detail: 'Credentials: panelrx_vani@*** \u2022 2FA: auto-verified', type: 'navigate', durationMs: 600 });
    steps.push({ agent: 'StatusAgent', action: 'Navigating to Claims Status', detail: 'Dashboard \u2192 Claims \u2192 Status Lookup', type: 'navigate', durationMs: 500 });
    steps.push({ agent: 'StatusAgent', action: 'Searching claim', detail: `Entering ref: ${claim.claimNo} in search field`, type: 'input', durationMs: 600 });
    steps.push({ agent: 'StatusAgent', action: 'Waiting for portal response', detail: 'Query submitted... loading results', type: 'waiting', durationMs: 800 });
  } else if (method === 'app') {
    steps.push({ agent: 'StatusAgent', action: `Launching ${access.url}`, detail: 'Opening mobile app interface...', type: 'connect', durationMs: 600 });
    steps.push({ agent: 'StatusAgent', action: 'App authentication', detail: 'Biometric login \u2022 Provider ID: PMC-KV-1234', type: 'navigate', durationMs: 500 });
    steps.push({ agent: 'StatusAgent', action: 'Navigating to claim', detail: 'Claims tab \u2192 Search \u2192 entering ref number', type: 'input', durationMs: 600 });
    steps.push({ agent: 'StatusAgent', action: 'Loading claim details', detail: 'Fetching status from PMCare servers...', type: 'waiting', durationMs: 700 });
  } else {
    steps.push({ agent: 'StatusAgent', action: `POST ${access.url}`, detail: `Authorization: Bearer ****\nContent-Type: application/json`, type: 'connect', durationMs: 500 });
    steps.push({ agent: 'StatusAgent', action: 'Sending request payload', detail: `{ "claim_ref": "${claim.claimNo}", "provider_id": "PMK-1234-WP" }`, type: 'input', durationMs: 400 });
    steps.push({ agent: 'StatusAgent', action: 'Awaiting API response', detail: 'HTTP 200 OK \u2022 Response time: 340ms', type: 'waiting', durationMs: 600 });
  }

  // 3. Response received
  steps.push({ agent: 'StatusAgent', action: `TPA responded: ${outcome.toUpperCase()}`, detail: response, type: 'response', durationMs: 800 });

  // 4. Decision agent
  if (outcome === 'promised_date') {
    steps.push({ agent: 'DecisionAgent', action: 'Analyzing TPA response', detail: `Promise detected: payment date mentioned. Extracting deadline...`, type: 'decision', durationMs: 600 });
    steps.push({ agent: 'DecisionAgent', action: `Setting smart cooldown: ${cooldown} days`, detail: `Claim snoozed until ${new Date(Date.now() + cooldown * 86400000).toISOString().slice(0, 10)}. Will auto-recheck if money not received.`, type: 'decision', durationMs: 500 });
  } else if (outcome === 'pending') {
    steps.push({ agent: 'DecisionAgent', action: 'No actionable update', detail: `TPA has no new status. Setting default cooldown: ${cooldown} days.`, type: 'decision', durationMs: 500 });
    steps.push({ agent: 'DecisionAgent', action: `Check count: ${claim.checkCount + 1}`, detail: claim.checkCount >= 2 ? 'WARNING: 3+ checks with no progress. Flagging for FollowUpAgent escalation.' : 'Within normal range. Will recheck after cooldown.', type: 'decision', durationMs: 400 });
  } else if (outcome === 'no_response') {
    steps.push({ agent: 'DecisionAgent', action: 'Connection failure detected', detail: 'TPA system unresponsive. Setting retry cooldown: 1 day.', type: 'decision', durationMs: 400 });
  } else if (outcome === 'approved') {
    steps.push({ agent: 'DecisionAgent', action: 'Claim approved by TPA', detail: `Monitoring for payment arrival. Cooldown: ${cooldown} days.`, type: 'decision', durationMs: 500 });
  }

  // 5. Log
  steps.push({ agent: 'LogAgent', action: 'Recording to audit trail', detail: `Check #${claim.checkCount + 1} logged \u2022 ${claim.claimNo} \u2022 ${claim.tpaName} \u2022 ${outcome}`, type: 'log', durationMs: 300 });

  return steps;
}

const STEP_ICON: Record<AgentStep['type'], typeof CheckCircle> = {
  init: Bot,
  connect: Zap,
  navigate: ArrowRight,
  input: FileText,
  waiting: Loader2,
  response: MessageSquare,
  decision: Shield,
  log: CheckCircle,
};

const STEP_COLOR: Record<AgentStep['type'], string> = {
  init: 'text-teal-400',
  connect: 'text-blue-400',
  navigate: 'text-purple-400',
  input: 'text-cyan-400',
  waiting: 'text-amber-400',
  response: 'text-emerald-400',
  decision: 'text-amber-300',
  log: 'text-green-400',
};

type SweepModalProps = {
  claims: ClaimCheckEntry[];
  responses: Record<string, { outcome: string; response: string; cooldownDays: number }>;
  onComplete: (results: { id: string; outcome: string; response: string; cooldownDays: number }[]) => void;
  onClose: () => void;
};

export function SweepModal({ claims, responses, onComplete, onClose }: SweepModalProps) {
  const [claimIdx, setClaimIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);
  const [visibleSteps, setVisibleSteps] = useState<(AgentStep & { done: boolean })[]>([]);
  const [completedClaims, setCompletedClaims] = useState<{ id: string; claimNo: string; tpa: string; outcome: string; response: string; cooldownDays: number }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [portalLines, setPortalLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const currentClaim = claims[claimIdx];
  const resp = currentClaim ? responses[currentClaim.id] : null;
  const steps = currentClaim ? generateSteps(
    currentClaim,
    resp?.outcome ?? 'pending',
    resp?.response ?? 'No update available.',
    resp?.cooldownDays ?? 7,
  ) : [];

  // Auto-scroll effect
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleSteps]);
  useEffect(() => {
    if (portalRef.current) portalRef.current.scrollTop = portalRef.current.scrollHeight;
  }, [portalLines]);

  // Step through the current claim
  useEffect(() => {
    if (isFinished || !currentClaim) return;

    // Start first step
    if (stepIdx === -1) {
      setStepIdx(0);
      setVisibleSteps([]);
      setPortalLines([]);
      return;
    }

    if (stepIdx >= steps.length) {
      // Claim done — record result
      const result = {
        id: currentClaim.id,
        claimNo: currentClaim.claimNo,
        tpa: currentClaim.tpaName,
        outcome: resp?.outcome ?? 'pending',
        response: resp?.response ?? 'No update.',
        cooldownDays: resp?.cooldownDays ?? 7,
      };
      setCompletedClaims((prev) => [...prev, result]);

      // Move to next claim or finish
      if (claimIdx + 1 >= claims.length) {
        setIsFinished(true);
        setTimeout(() => onComplete([...completedClaims, result]), 1500);
      } else {
        setTimeout(() => {
          setClaimIdx((i) => i + 1);
          setStepIdx(-1);
        }, 800);
      }
      return;
    }

    const step = steps[stepIdx];

    // Add step as "in progress"
    setVisibleSteps((prev) => [...prev, { ...step, done: false }]);

    // Generate portal line
    const portalLine = `[${new Date().toLocaleTimeString('en-MY', { hour12: false })}] ${step.agent} > ${step.action}`;
    setPortalLines((prev) => [...prev, portalLine]);

    const timer = setTimeout(() => {
      // Mark step as done
      setVisibleSteps((prev) => prev.map((s, i) => i === prev.length - 1 ? { ...s, done: true } : s));
      setStepIdx((i) => i + 1);
    }, step.durationMs);

    return () => clearTimeout(timer);
  }, [stepIdx, claimIdx, isFinished]);

  const access = currentClaim ? TPA_ACCESS[currentClaim.tpaName] ?? { method: 'portal', url: currentClaim.tpaName, icon: Monitor } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0A0E1A]/95 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-[95vw] max-w-7xl h-[90vh] bg-[#0D1117] border border-[#1E293B] rounded-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E293B] bg-[#0D1117]">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono text-sm text-white font-medium">StatusAgent Autonomous Sweep</span>
            <span className="font-mono text-[11px] text-[#64748B]">
              Claim {claimIdx + 1} of {claims.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#64748B]">
              <span className="text-emerald-400">{completedClaims.length} done</span>
              <span>{claims.length - completedClaims.length - (isFinished ? 0 : 1)} remaining</span>
            </div>
            <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors" type="button">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#1E293B]">
          <motion.div
            className="h-full bg-emerald-400"
            animate={{ width: `${((claimIdx + (stepIdx / Math.max(steps.length, 1))) / claims.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Main content — 3 column layout */}
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">

          {/* LEFT: Agent Activity Log (terminal style) */}
          <div className="col-span-5 border-r border-[#1E293B] flex flex-col">
            <div className="px-4 py-2 border-b border-[#1E293B] flex items-center gap-2">
              <Bot size={14} className="text-teal-400" />
              <span className="font-mono text-[11px] text-[#94A3B8]">Agent Activity Log</span>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1">
              {/* Completed claims summary */}
              {completedClaims.map((c) => (
                <div key={c.id} className="font-mono text-[10px] text-[#475569] py-0.5">
                  <span className="text-emerald-500">\u2713</span> {c.claimNo} \u2022 {c.tpa} \u2022 {c.outcome}
                </div>
              ))}
              {completedClaims.length > 0 && visibleSteps.length > 0 && (
                <div className="border-t border-[#1E293B] my-2" />
              )}
              {/* Current claim steps */}
              {visibleSteps.map((step, i) => {
                const Icon = STEP_ICON[step.type];
                const color = STEP_COLOR[step.type];
                const isLast = i === visibleSteps.length - 1 && !step.done;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 py-1"
                  >
                    <div className="shrink-0 mt-0.5">
                      {isLast ? (
                        <Loader2 size={12} className={`${color} animate-spin`} />
                      ) : (
                        <Icon size={12} className={step.done ? 'text-emerald-500' : color} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-teal-400">{step.agent}</span>
                        <span className="font-mono text-[10px] text-[#94A3B8]">{step.action}</span>
                      </div>
                      <p className="font-mono text-[9px] text-[#64748B] leading-relaxed whitespace-pre-wrap">{step.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
              {isFinished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 py-2 text-center"
                >
                  <p className="font-mono text-xs text-emerald-400">\u2713 All {claims.length} claims processed</p>
                  <p className="font-mono text-[10px] text-[#64748B] mt-1">Closing in 1.5s...</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* CENTER: Portal Simulation */}
          <div className="col-span-4 border-r border-[#1E293B] flex flex-col">
            <div className="px-4 py-2 border-b border-[#1E293B] flex items-center gap-2">
              {access && <access.icon size={14} className="text-blue-400" />}
              <span className="font-mono text-[11px] text-[#94A3B8]">
                {currentClaim ? `${currentClaim.tpaName} \u2022 ${access?.method.toUpperCase()}` : 'Waiting...'}
              </span>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {currentClaim && access && (
                <PortalView
                  tpa={currentClaim.tpaName}
                  method={access.method}
                  url={access.url}
                  claim={currentClaim}
                  steps={visibleSteps}
                  isFinished={isFinished}
                />
              )}
            </div>
          </div>

          {/* RIGHT: Claim context + Decision */}
          <div className="col-span-3 flex flex-col">
            <div className="px-4 py-2 border-b border-[#1E293B] flex items-center gap-2">
              <Shield size={14} className="text-amber-400" />
              <span className="font-mono text-[11px] text-[#94A3B8]">Claim Context</span>
            </div>

            {currentClaim && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Claim card */}
                <div className="bg-[#161B22] rounded border border-[#21262D] p-3 space-y-2">
                  <p className="font-mono text-xs text-white">{currentClaim.claimNo}</p>
                  <div className="space-y-1 text-[10px] font-mono">
                    <Row label="Patient" value={currentClaim.patientName} />
                    <Row label="TPA" value={currentClaim.tpaName} />
                    <Row label="Amount" value={`RM ${currentClaim.grossAmountRm.toFixed(2)}`} valueColor="text-white" />
                    <Row label="Outstanding" value={`${currentClaim.daysOutstanding} days`}
                      valueColor={currentClaim.daysOutstanding > 60 ? 'text-red-400' : 'text-amber-400'} />
                    <Row label="Connector" value={access?.method.toUpperCase() ?? 'UNKNOWN'} />
                    <Row label="Check #" value={String(currentClaim.checkCount + 1)} />
                  </div>
                </div>

                {/* Decision trace */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">Decision Trace</p>
                  {visibleSteps.filter((s) => s.type === 'response' || s.type === 'decision' || s.type === 'log').map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#161B22] rounded border border-[#21262D] p-2"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-mono ${
                          step.type === 'response' ? 'text-emerald-400' : step.type === 'decision' ? 'text-amber-300' : 'text-green-400'
                        }`}>{step.agent}</span>
                      </div>
                      <p className="font-mono text-[9px] text-[#94A3B8]">{step.action}</p>
                      <p className="font-mono text-[9px] text-[#64748B] mt-0.5">{step.detail}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Completed claims mini-list */}
                {completedClaims.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">Completed this sweep</p>
                    {completedClaims.map((c) => {
                      const color = c.outcome === 'promised_date' ? 'text-teal-400' : c.outcome === 'approved' ? 'text-emerald-400' : c.outcome === 'no_response' ? 'text-red-400' : 'text-amber-400';
                      return (
                        <div key={c.id} className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#94A3B8]">{c.claimNo}</span>
                          <span className={color}>{c.outcome.replace('_', ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="px-5 py-2 border-t border-[#1E293B] bg-[#0D1117] flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              StatusAgent active
            </span>
            <span>DecisionAgent active</span>
            <span>LogAgent active</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-[#64748B]">
            <span>Queue: {claims.length} claims \u2022 {formatRM(claims.reduce((s, c) => s + c.grossAmountRm, 0))}</span>
            <span>Runtime: {Math.round((completedClaims.length + 1) * 4.5)}s</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Helper: key-value row ───
function Row({ label, value, valueColor = 'text-[#94A3B8]' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#64748B]">{label}</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}

function formatRM(n: number): string {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Portal Simulation View ───
function PortalView({ tpa, method, url, claim, steps, isFinished }: {
  tpa: string; method: string; url: string; claim: ClaimCheckEntry;
  steps: (AgentStep & { done: boolean })[]; isFinished: boolean;
}) {
  const connectStep = steps.find((s) => s.type === 'connect');
  const inputStep = steps.find((s) => s.type === 'input');
  const waitStep = steps.find((s) => s.type === 'waiting');
  const responseStep = steps.find((s) => s.type === 'response');
  const hasConnected = !!connectStep;
  const hasInput = !!inputStep;
  const isWaiting = waitStep && !waitStep.done;
  const hasResponse = !!responseStep;

  if (method === 'hotline') return <HotlineView tpa={tpa} url={url} claim={claim} hasConnected={hasConnected} hasInput={hasInput} isWaiting={!!isWaiting} hasResponse={hasResponse} responseStep={responseStep} />;
  if (method === 'portal') return <BrowserView tpa={tpa} url={url} claim={claim} hasConnected={hasConnected} hasInput={hasInput} isWaiting={!!isWaiting} hasResponse={hasResponse} responseStep={responseStep} />;
  if (method === 'app') return <AppView tpa={tpa} claim={claim} hasConnected={hasConnected} hasInput={hasInput} isWaiting={!!isWaiting} hasResponse={hasResponse} responseStep={responseStep} />;
  return <TerminalView tpa={tpa} url={url} claim={claim} steps={steps} />;
}

// ─── Hotline simulation ───
function HotlineView({ tpa, url, claim, hasConnected, hasInput, isWaiting, hasResponse, responseStep }: {
  tpa: string; url: string; claim: ClaimCheckEntry; hasConnected: boolean; hasInput: boolean; isWaiting: boolean; hasResponse: boolean; responseStep?: AgentStep & { done: boolean };
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0A0E14]">
      <Phone size={32} className="text-emerald-400 mb-3" />
      <p className="font-mono text-sm text-white mb-1">{tpa} Hotline</p>
      <p className="font-mono text-[10px] text-[#64748B] mb-6">{url}</p>

      <div className="w-full max-w-xs space-y-3">
        <StatusLine done={hasConnected} active={!hasConnected} label="Connecting to IVR..." />
        {hasConnected && <StatusLine done={hasInput} active={hasConnected && !hasInput} label="Press 1 \u2192 Claims Status \u2192 Existing" />}
        {hasInput && <StatusLine done={!isWaiting} active={isWaiting} label={`Ref: ${claim.claimNo} \u2022 Verifying...`} />}
        {isWaiting && (
          <div className="text-center">
            <motion.div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-mono" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
              <Phone size={10} /> On hold... waiting for operator
            </motion.div>
          </div>
        )}
        {hasResponse && responseStep && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161B22] rounded border border-emerald-900/50 p-3 mt-3">
            <p className="font-mono text-[10px] text-emerald-400 mb-1">OPERATOR RESPONSE</p>
            <p className="font-mono text-[10px] text-[#94A3B8] leading-relaxed">{responseStep.detail}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Browser portal simulation ───
function BrowserView({ tpa, url, claim, hasConnected, hasInput, isWaiting, hasResponse, responseStep }: {
  tpa: string; url: string; claim: ClaimCheckEntry; hasConnected: boolean; hasInput: boolean; isWaiting: boolean; hasResponse: boolean; responseStep?: AgentStep & { done: boolean };
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0E14]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="flex-1 bg-[#0D1117] rounded px-2 py-0.5 font-mono text-[10px] text-[#64748B] flex items-center gap-1">
          <span className="text-emerald-500">\uD83D\uDD12</span> https://{url}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Login */}
        {!hasConnected && (
          <div className="space-y-2">
            <div className="h-6 w-32 bg-[#161B22] rounded animate-pulse" />
            <div className="h-8 w-full bg-[#161B22] rounded animate-pulse" />
            <div className="h-8 w-full bg-[#161B22] rounded animate-pulse" />
          </div>
        )}
        {hasConnected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] text-emerald-400">\u2713 Authenticated</span>
              <span className="font-mono text-[9px] text-[#475569]">panelrx_vani@***</span>
            </div>
            {/* Nav tabs */}
            <div className="flex gap-2 mb-3 text-[10px] font-mono">
              <span className="text-[#475569] px-2 py-1 rounded bg-[#161B22]">Dashboard</span>
              <span className="text-white px-2 py-1 rounded bg-teal-800/50 border border-teal-700/50">Claims</span>
              <span className="text-[#475569] px-2 py-1 rounded bg-[#161B22]">Reports</span>
            </div>

            {/* Search field */}
            <div className="bg-[#161B22] rounded border border-[#21262D] p-2 mb-3">
              <p className="font-mono text-[9px] text-[#475569] mb-1">Claim Reference Search</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0D1117] rounded px-2 py-1 font-mono text-[10px] text-white border border-[#21262D]">
                  {hasInput ? claim.claimNo : ''}
                  {!hasInput && <motion.span className="text-teal-400" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}
                </div>
                <button className={`px-2 py-1 rounded text-[9px] font-mono ${hasInput ? 'bg-teal-600 text-white' : 'bg-[#21262D] text-[#475569]'}`}>Search</button>
              </div>
            </div>

            {/* Loading / Results */}
            {isWaiting && (
              <div className="flex items-center gap-2 py-4 justify-center">
                <Loader2 size={14} className="text-teal-400 animate-spin" />
                <span className="font-mono text-[10px] text-[#64748B]">Querying {tpa} database...</span>
              </div>
            )}

            {hasResponse && responseStep && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161B22] rounded border border-[#21262D] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] text-[#475569]">CLAIM STATUS</span>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{responseStep.action.split(': ')[1]}</span>
                </div>
                <p className="font-mono text-[10px] text-[#94A3B8] leading-relaxed">{responseStep.detail}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── App simulation ───
function AppView({ tpa, claim, hasConnected, hasInput, isWaiting, hasResponse, responseStep }: {
  tpa: string; claim: ClaimCheckEntry; hasConnected: boolean; hasInput: boolean; isWaiting: boolean; hasResponse: boolean; responseStep?: AgentStep & { done: boolean };
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0E14] items-center py-6">
      {/* Phone frame */}
      <div className="w-48 bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
        {/* Status bar */}
        <div className="flex justify-between px-3 py-1 text-[8px] font-mono text-[#475569]">
          <span>2:17 PM</span>
          <span>5G \u2022 100%</span>
        </div>
        {/* App header */}
        <div className="bg-teal-800/30 px-3 py-2 text-center">
          <p className="font-mono text-[10px] text-white font-medium">{tpa}</p>
          <p className="font-mono text-[8px] text-[#64748B]">Provider Portal</p>
        </div>
        {/* App body */}
        <div className="px-3 py-2 space-y-2 min-h-[160px]">
          {!hasConnected && (
            <div className="flex flex-col items-center py-4">
              <Loader2 size={16} className="text-teal-400 animate-spin mb-2" />
              <p className="font-mono text-[8px] text-[#475569]">Authenticating...</p>
            </div>
          )}
          {hasConnected && !hasInput && (
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-[#21262D] rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-[#21262D] rounded animate-pulse" />
            </div>
          )}
          {hasInput && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              <p className="font-mono text-[8px] text-[#475569]">Claim Lookup</p>
              <div className="bg-[#0D1117] rounded px-2 py-1 font-mono text-[8px] text-white border border-[#21262D]">{claim.claimNo}</div>
              {isWaiting && <div className="h-2 w-full bg-teal-600/30 rounded overflow-hidden"><motion.div className="h-full bg-teal-400 rounded" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} /></div>}
              {hasResponse && responseStep && (
                <div className="bg-emerald-900/20 border border-emerald-800/30 rounded p-1.5">
                  <p className="font-mono text-[7px] text-emerald-400 leading-relaxed">{responseStep.detail.slice(0, 80)}...</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
        {/* Tab bar */}
        <div className="flex justify-around px-2 py-1.5 border-t border-[#21262D] text-[7px] font-mono text-[#475569]">
          <span>Home</span>
          <span className="text-teal-400">Claims</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
}

// ─── Terminal/API simulation ───
function TerminalView({ tpa, url, claim, steps }: {
  tpa: string; url: string; claim: ClaimCheckEntry; steps: (AgentStep & { done: boolean })[];
}) {
  return (
    <div className="flex-1 bg-[#0A0E14] p-4 overflow-y-auto font-mono text-[10px]">
      <p className="text-[#475569] mb-2"># StatusAgent \u2022 {tpa} API Connector</p>
      <p className="text-[#475569] mb-3">$ curl -X POST https://{url}</p>
      {steps.map((step, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-1">
          {step.type === 'connect' && <p className="text-blue-400">&gt; Authorization: Bearer ****{'\n'}&gt; Content-Type: application/json</p>}
          {step.type === 'input' && <p className="text-cyan-400">&gt; {step.detail}</p>}
          {step.type === 'waiting' && <p className="text-amber-400">{step.done ? step.detail : <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>Waiting for response...</motion.span>}</p>}
          {step.type === 'response' && <p className="text-emerald-400">&lt; 200 OK{'\n'}&lt; {step.detail}</p>}
          {(step.type === 'decision' || step.type === 'log') && <p className="text-[#64748B]">// {step.action}: {step.detail}</p>}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Status line with animated dots ───
function StatusLine({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px]">
      {done ? <CheckCircle size={12} className="text-emerald-400 shrink-0" /> : active ? <Loader2 size={12} className="text-teal-400 animate-spin shrink-0" /> : <Clock size={12} className="text-[#475569] shrink-0" />}
      <span className={done ? 'text-[#94A3B8]' : active ? 'text-white' : 'text-[#475569]'}>{label}</span>
    </div>
  );
}
