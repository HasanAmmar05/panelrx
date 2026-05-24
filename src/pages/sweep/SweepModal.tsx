import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Phone, Monitor, Globe, Smartphone, CheckCircle, Clock, AlertTriangle,
  CalendarClock, RotateCcw, XCircle, Loader2, Bot, ArrowRight,
  Shield, FileText, MessageSquare, Zap, Mic, Volume2
} from 'lucide-react';
import type { ClaimCheckEntry } from '../../data/types';
import { playDialTone, playRingTone, playDTMF, playConnectChime, playHangupTone, playKeyClick, playSuccessChime, playHoldBeep, playAlertBeep, speakText, stopSpeech } from '../../lib/sounds';

const DTMF_KEYS = '0123456789*#';

// ─── Per-TPA Access Methods ───
const TPA_ACCESS: Record<string, { method: 'hotline' | 'portal' | 'api' | 'app'; url: string; icon: typeof Phone }> = {
  MiCare: { method: 'hotline', url: '1-800-88-MICARE', icon: Phone },
  MediExpress: { method: 'portal', url: 'mediexpress.com.my/provider', icon: Monitor },
  IHP: { method: 'portal', url: 'portal.ihp.com.my/claims', icon: Monitor },
  PMCare: { method: 'app', url: 'PMCare Provider App v3.2', icon: Smartphone },
  SelCare: { method: 'api', url: 'api.selcare.com.my/v2/claims', icon: Globe },
  'PeKa B40': { method: 'api', url: 'api.pekab40.gov.my/v1/status', icon: Globe },
};

// ─── Voice call dialogue scripts (for hotline TPA) ───
type DialogueLine = { speaker: 'agent' | 'operator' | 'system'; text: string; durationMs: number };

function getCallDialogue(claim: ClaimCheckEntry, response: string): DialogueLine[] {
  return [
    { speaker: 'system', text: 'Connecting to IVR system...', durationMs: 1500 },
    { speaker: 'system', text: 'Welcome to MiCare. For Bahasa Melayu, tekan 1. For English, press 2.', durationMs: 2000 },
    { speaker: 'agent', text: 'Pressing 2 for English...', durationMs: 1000 },
    { speaker: 'system', text: 'For Claims Status, press 1. For New Claims, press 2. For Panel Registration, press 3.', durationMs: 2500 },
    { speaker: 'agent', text: 'Pressing 1 for Claims Status...', durationMs: 1000 },
    { speaker: 'system', text: 'Please enter your provider registration number followed by hash.', durationMs: 1800 },
    { speaker: 'agent', text: 'Entering: PMK-1234-WP #', durationMs: 1200 },
    { speaker: 'system', text: 'Please hold while we connect you to a claims officer. Your estimated wait time is 2 minutes.', durationMs: 2500 },
    { speaker: 'system', text: '\u266B Hold music playing... (0:42)', durationMs: 2000 },
    { speaker: 'operator', text: 'Hello, MiCare claims department, this is Sarah speaking. How can I help you?', durationMs: 2500 },
    { speaker: 'agent', text: `Hi Sarah, I\u2019m calling from Klinik Dr Vani, registration PMK-1234-WP. I\u2019m checking the status of claim ${claim.claimNo} for patient IC ending ****${claim.patientName.slice(-3)}.`, durationMs: 3000 },
    { speaker: 'operator', text: 'Let me pull that up... one moment please.', durationMs: 2000 },
    { speaker: 'system', text: '\u266B Brief hold (0:15)', durationMs: 1500 },
    { speaker: 'operator', text: `Yes, I can see claim ${claim.claimNo}. ${response}`, durationMs: 3000 },
    { speaker: 'agent', text: 'Thank you Sarah. Can you confirm the expected payment date?', durationMs: 2000 },
    { speaker: 'operator', text: 'Yes, it should be processed in the next batch cycle. You should see it within 7 working days.', durationMs: 2500 },
    { speaker: 'agent', text: 'Perfect, I\u2019ll note that down. Thank you for your help.', durationMs: 1500 },
    { speaker: 'operator', text: 'You\u2019re welcome. Is there anything else?', durationMs: 1500 },
    { speaker: 'agent', text: 'That\u2019s all for this claim. Thank you, bye.', durationMs: 1200 },
    { speaker: 'system', text: 'Call ended. Duration: 3:42', durationMs: 1000 },
  ];
}

// ─── Step scripts ───
type AgentStep = {
  agent: string;
  action: string;
  detail: string;
  type: 'init' | 'connect' | 'navigate' | 'input' | 'waiting' | 'response' | 'decision' | 'log' | 'voice_call';
  durationMs: number;
};

function generateSteps(claim: ClaimCheckEntry, outcome: string, response: string, cooldown: number): AgentStep[] {
  const access = TPA_ACCESS[claim.tpaName] ?? { method: 'portal', url: `${claim.tpaName.toLowerCase()}.com.my`, icon: Monitor };
  const method = access.method;
  const steps: AgentStep[] = [];

  // 1. Orchestrator
  steps.push({ agent: 'OrchestratorAgent', action: 'Selecting claim from queue', detail: `${claim.claimNo} \u2022 ${claim.patientName} \u2022 ${claim.tpaName} \u2022 RM ${claim.grossAmountRm} \u2022 ${claim.daysOutstanding}d outstanding`, type: 'init', durationMs: 1200 });
  steps.push({ agent: 'OrchestratorAgent', action: 'Analyzing claim priority', detail: `Days overdue: ${claim.daysOutstanding} \u2022 Previous checks: ${claim.checkCount} \u2022 Priority: ${claim.daysOutstanding > 60 ? 'HIGH' : 'NORMAL'}`, type: 'init', durationMs: 1000 });
  steps.push({ agent: 'OrchestratorAgent', action: 'Routing to StatusAgent', detail: `Connector: ${method.toUpperCase()} \u2022 Endpoint: ${access.url}`, type: 'init', durationMs: 800 });

  // 2. Connection (method-specific)
  if (method === 'hotline') {
    steps.push({ agent: 'StatusAgent', action: `Initiating voice call to ${access.url}`, detail: 'TTS engine active \u2022 Voice: en-MY-Yasmin \u2022 Starting IVR navigation...', type: 'voice_call', durationMs: 35000 }); // voice call runs its own timeline
  } else if (method === 'portal') {
    steps.push({ agent: 'StatusAgent', action: `Opening ${access.url}`, detail: 'Loading portal... Chromium headless instance started', type: 'connect', durationMs: 1800 });
    steps.push({ agent: 'StatusAgent', action: 'Authenticating with portal', detail: 'Credentials: ClinicMate_vani@*** \u2022 2FA token: auto-generated \u2022 CAPTCHA: bypassed via API key', type: 'navigate', durationMs: 1500 });
    steps.push({ agent: 'StatusAgent', action: 'Navigating to Claims Status', detail: 'Dashboard \u2192 Claims Management \u2192 Status Lookup \u2022 Page loaded in 1.2s', type: 'navigate', durationMs: 1200 });
    steps.push({ agent: 'StatusAgent', action: 'Entering search criteria', detail: `Claim ref: ${claim.claimNo} \u2022 Patient IC: ****${claim.patientName.slice(-3)} \u2022 Clicking search...`, type: 'input', durationMs: 1500 });
    steps.push({ agent: 'StatusAgent', action: 'Waiting for portal response', detail: 'Query submitted to TPA database... loading results page', type: 'waiting', durationMs: 2500 });
  } else if (method === 'app') {
    steps.push({ agent: 'StatusAgent', action: `Launching ${access.url}`, detail: 'Mobile app bridge active \u2022 Device: virtual Android 14', type: 'connect', durationMs: 1500 });
    steps.push({ agent: 'StatusAgent', action: 'App authentication', detail: 'Biometric simulation \u2022 Provider ID: PMC-KV-1234 \u2022 Session token acquired', type: 'navigate', durationMs: 1200 });
    steps.push({ agent: 'StatusAgent', action: 'Navigating to claim lookup', detail: 'Claims tab \u2192 Search \u2192 entering reference number', type: 'input', durationMs: 1300 });
    steps.push({ agent: 'StatusAgent', action: 'Loading claim details from server', detail: 'Fetching status from PMCare servers... response pending', type: 'waiting', durationMs: 2000 });
  } else {
    steps.push({ agent: 'StatusAgent', action: `POST https://${access.url}`, detail: 'Authorization: Bearer ****\nContent-Type: application/json\nX-Provider-ID: PMK-1234-WP', type: 'connect', durationMs: 1200 });
    steps.push({ agent: 'StatusAgent', action: 'Sending request payload', detail: `{\n  "claim_ref": "${claim.claimNo}",\n  "provider_id": "PMK-1234-WP",\n  "request_type": "status_check"\n}`, type: 'input', durationMs: 1000 });
    steps.push({ agent: 'StatusAgent', action: 'Awaiting API response', detail: 'HTTP request sent... waiting for TPA server', type: 'waiting', durationMs: 1800 });
  }

  // 3. Response (skip for hotline — handled in voice call)
  if (method !== 'hotline') {
    steps.push({ agent: 'StatusAgent', action: `TPA responded: ${outcome.toUpperCase()}`, detail: response, type: 'response', durationMs: 2000 });
  }

  // 4. Decision agent
  steps.push({ agent: 'DecisionAgent', action: 'Parsing TPA response', detail: `NLP analysis: extracting dates, amounts, status keywords...`, type: 'decision', durationMs: 1200 });

  if (outcome === 'promised_date') {
    steps.push({ agent: 'DecisionAgent', action: 'Promise date detected', detail: `Payment date mentioned in response. Extracting: "${response.match(/\d+\s*(?:working\s+)?days?|May\s+\d+|April\s+\d+/i)?.[0] ?? 'next cycle'}"`, type: 'decision', durationMs: 1500 });
    steps.push({ agent: 'DecisionAgent', action: `Setting smart cooldown: ${cooldown} days`, detail: `Claim snoozed until ${new Date(Date.now() + cooldown * 86400000).toISOString().slice(0, 10)}.\nRule: Will auto-recheck if payment not received by then.\nIf still unpaid after recheck \u2192 escalate to FollowUpAgent.`, type: 'decision', durationMs: 1500 });
  } else if (outcome === 'pending') {
    steps.push({ agent: 'DecisionAgent', action: 'No actionable update from TPA', detail: `TPA status unchanged. Default cooldown: ${cooldown} days.\nCheck history: ${claim.checkCount + 1} total checks.`, type: 'decision', durationMs: 1200 });
    if (claim.checkCount >= 2) {
      steps.push({ agent: 'DecisionAgent', action: '\u26A0 Escalation threshold reached', detail: `3+ checks with no progress. Flagging for FollowUpAgent.\nWill send formal reminder to ${claim.tpaName} citing panel agreement clause 4.2.`, type: 'decision', durationMs: 1500 });
    }
  } else if (outcome === 'no_response') {
    steps.push({ agent: 'DecisionAgent', action: 'Connection failure detected', detail: `TPA system unresponsive. Retry in 1 day.\nIncident logged. If failure persists \u2192 alert clinic admin.`, type: 'decision', durationMs: 1200 });
  } else if (outcome === 'approved') {
    steps.push({ agent: 'DecisionAgent', action: 'Claim approved \u2014 monitoring payment', detail: `TPA confirmed approval. Watching for bank deposit.\nCooldown: ${cooldown} days. Auto-match with remittance on arrival.`, type: 'decision', durationMs: 1500 });
  }

  // 5. Log
  steps.push({ agent: 'LogAgent', action: 'Recording to audit trail', detail: `Check #${claim.checkCount + 1} logged \u2022 ${claim.claimNo} \u2022 ${claim.tpaName} \u2022 Outcome: ${outcome}\nTimestamp: ${new Date().toISOString()}`, type: 'log', durationMs: 800 });

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
  voice_call: Phone,
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
  voice_call: 'text-emerald-400',
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
  // Voice call state
  const [callDialogue, setCallDialogue] = useState<DialogueLine[]>([]);
  const [visibleDialogue, setVisibleDialogue] = useState<DialogueLine[]>([]);
  const [isInVoiceCall, setIsInVoiceCall] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<HTMLDivElement>(null);

  const currentClaim = claims[claimIdx];
  const resp = currentClaim ? responses[currentClaim.id] : null;
  const steps = currentClaim ? generateSteps(
    currentClaim,
    resp?.outcome ?? 'pending',
    resp?.response ?? 'No update available.',
    resp?.cooldownDays ?? 7,
  ) : [];

  // Auto-scroll
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleSteps]);
  useEffect(() => {
    if (callRef.current) callRef.current.scrollTop = callRef.current.scrollHeight;
  }, [visibleDialogue]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Voice call runner
  useEffect(() => {
    if (!isInVoiceCall || callDialogue.length === 0) return;
    let idx = 0;
    let activeTimer: ReturnType<typeof setTimeout> | null = null;

    const showNext = () => {
      if (idx >= callDialogue.length) {
        // Call ended sound
        playHangupTone();
        // Wait 3 seconds to keep the call screen visible before proceeding
        activeTimer = setTimeout(() => {
          // Call done — add response step to log
          const respText = resp?.response ?? 'No update.';
          setVisibleSteps((prev) => [...prev, { agent: 'StatusAgent', action: `TPA responded: ${(resp?.outcome ?? 'pending').toUpperCase()}`, detail: respText, type: 'response', done: true, durationMs: 0 }]);
          setIsInVoiceCall(false);
          // Mark voice_call step as done
          setVisibleSteps((prev) => prev.map((s) => s.type === 'voice_call' ? { ...s, done: true } : s));
          setStepIdx((i) => i + 1);
        }, 3000);
        return;
      }

      const line = callDialogue[idx];
      setVisibleDialogue((prev) => [...prev, line]);

      // Sound effects based on dialogue content
      if (line.speaker === 'system') {
        if (line.text.includes('Connecting')) {
          playDialTone(1200);
          activeTimer = setTimeout(playRingTone, 1300);
        } else if (line.text.includes('Welcome to')) {
          playConnectChime();
        } else if (line.text.includes('Hold music') || line.text.includes('hold')) {
          playHoldBeep();
        } else if (line.text.includes('press') || line.text.includes('Press')) {
          playHoldBeep();
        }
      } else if (line.speaker === 'agent') {
        if (line.text.includes('Pressing 1')) {
          activeTimer = setTimeout(() => playDTMF('1', 200), 300);
        } else if (line.text.includes('Pressing 2')) {
          activeTimer = setTimeout(() => playDTMF('2', 200), 300);
        } else if (line.text.includes('Pressing 3')) {
          activeTimer = setTimeout(() => playDTMF('3', 200), 300);
        } else if (line.text.includes('Entering:')) {
          // Type out provider number with key clicks
          const chars = 'PMK-1234-WP#';
          chars.split('').forEach((ch, ci) => {
            setTimeout(() => {
              if (DTMF_KEYS.includes(ch)) playDTMF(ch, 80);
              else playKeyClick();
            }, 60 * ci + 200);
          });
        } else {
          playKeyClick();
        }
      } else if (line.speaker === 'operator') {
        if (line.text.includes('Hello')) {
          playConnectChime();
        }
      }

      // Action to perform when line finishes (advance to next speaker)
      const onLineEnd = () => {
        idx++;
        // Add a natural 400ms pause between conversational turns
        activeTimer = setTimeout(showNext, 400);
      };

      // Determine if this is an ambient system state or actual speech
      const isAmbientSystem = line.speaker === 'system' && (
        line.text.includes('Connecting') ||
        line.text.includes('Hold music') ||
        line.text.includes('hold') ||
        line.text.includes('ended')
      );

      if (isAmbientSystem) {
        activeTimer = setTimeout(onLineEnd, line.durationMs);
      } else {
        // Real conversational voice via Browser Text-To-Speech Synthesis
        speakText(line.text, line.speaker, onLineEnd);
      }
    };

    const startTimer = setTimeout(showNext, 500);

    return () => {
      clearTimeout(startTimer);
      if (activeTimer) clearTimeout(activeTimer);
      stopSpeech();
    };
  }, [isInVoiceCall, callDialogue]);

  // Step engine
  useEffect(() => {
    if (isFinished || !currentClaim || isInVoiceCall) return;

    if (stepIdx === -1) {
      setStepIdx(0);
      setVisibleSteps([]);
      setVisibleDialogue([]);
      setCallDialogue([]);
      return;
    }

    if (stepIdx >= steps.length) {
      const result = {
        id: currentClaim.id, claimNo: currentClaim.claimNo, tpa: currentClaim.tpaName,
        outcome: resp?.outcome ?? 'pending', response: resp?.response ?? 'No update.',
        cooldownDays: resp?.cooldownDays ?? 7,
      };
      setCompletedClaims((prev) => [...prev, result]);

      if (claimIdx + 1 >= claims.length) {
        setIsFinished(true);
        playSuccessChime();
        // Keep the completed screen open for 5.5 seconds (stale for 2-3 extra seconds)
        setTimeout(() => {
          onComplete([...completedClaims, result]);
        }, 5500);
      } else {
        // Wait 3.5 seconds (slower flow) before starting the next claim
        setTimeout(() => { setClaimIdx((i) => i + 1); setStepIdx(-1); }, 3500);
      }
      return;
    }

    const step = steps[stepIdx];

    // Handle voice call step
    if (step.type === 'voice_call') {
      setVisibleSteps((prev) => [...prev, { ...step, done: false }]);
      const dialogue = getCallDialogue(currentClaim, resp?.response ?? 'No update available.');
      setCallDialogue(dialogue);
      setIsInVoiceCall(true);
      return;
    }

    setVisibleSteps((prev) => [...prev, { ...step, done: false }]);

    const timer = setTimeout(() => {
      setVisibleSteps((prev) => prev.map((s, i) => i === prev.length - 1 ? { ...s, done: true } : s));
      setStepIdx((i) => i + 1);
    }, step.durationMs);

    return () => clearTimeout(timer);
  }, [stepIdx, claimIdx, isFinished, isInVoiceCall]);

  const access = currentClaim ? TPA_ACCESS[currentClaim.tpaName] ?? { method: 'portal', url: currentClaim.tpaName, icon: Monitor } : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0A0E1A]/95 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-[96vw] max-w-[1400px] h-[92vh] bg-[#0D1117] border border-[#1E293B] rounded-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="font-mono text-sm text-white font-medium">StatusAgent Autonomous Sweep</span>
            <span className="font-mono text-[11px] text-[#64748B]">Claim {claimIdx + 1} of {claims.length}</span>
            {isInVoiceCall && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                <Phone size={10} /> LIVE CALL
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#64748B]">
              <span className="text-emerald-400">{completedClaims.length} done</span>
              <span>{claims.length - completedClaims.length - (isFinished ? 0 : 1)} remaining</span>
            </div>
            <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors" type="button"><X size={18} /></button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-[#1E293B]">
          <motion.div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400" animate={{ width: `${((claimIdx + (stepIdx / Math.max(steps.length, 1))) / claims.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>

        {/* 3-column layout */}
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">

          {/* LEFT: Agent Log */}
          <div className="col-span-5 border-r border-[#1E293B] flex flex-col">
            <div className="px-4 py-2.5 border-b border-[#1E293B] flex items-center gap-2">
              <Bot size={14} className="text-teal-400" />
              <span className="font-mono text-[11px] text-[#94A3B8]">Agent Activity Log</span>
              <span className="ml-auto font-mono text-[9px] text-[#475569]">{visibleSteps.length} steps</span>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {completedClaims.map((c) => (
                <div key={c.id} className="font-mono text-[10px] text-[#475569] py-0.5">
                  <span className="text-emerald-500">{'\u2713'}</span> {c.claimNo} {'\u2022'} {c.tpa} {'\u2022'} {c.outcome}
                </div>
              ))}
              {completedClaims.length > 0 && visibleSteps.length > 0 && <div className="border-t border-[#1E293B] my-2" />}
              {visibleSteps.map((step, i) => {
                const Icon = STEP_ICON[step.type];
                const color = STEP_COLOR[step.type];
                const isLast = i === visibleSteps.length - 1 && !step.done;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 py-1">
                    <div className="shrink-0 mt-0.5">
                      {isLast ? <Loader2 size={12} className={`${color} animate-spin`} /> : <Icon size={12} className={step.done ? 'text-emerald-500' : color} />}
                    </div>
                    <div className="min-w-0 flex-1">
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 py-3 text-center border-t border-[#1E293B]">
                  <p className="font-mono text-sm text-emerald-400">{'\u2713'} All {claims.length} claims processed</p>
                  <p className="font-mono text-[10px] text-[#64748B] mt-1">Results saved to audit trail. Closing...</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* CENTER: Portal / Voice Call Simulation */}
          <div className="col-span-4 border-r border-[#1E293B] flex flex-col">
            <div className="px-4 py-2.5 border-b border-[#1E293B] flex items-center gap-2">
              {access && <access.icon size={14} className="text-blue-400" />}
              <span className="font-mono text-[11px] text-[#94A3B8]">
                {currentClaim ? `${currentClaim.tpaName} ${'\u2022'} ${access?.method.toUpperCase()}` : 'Waiting...'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {currentClaim && access && isInVoiceCall ? (
                <VoiceCallView
                  tpa={currentClaim.tpaName}
                  url={TPA_ACCESS[currentClaim.tpaName]?.url ?? ''}
                  claim={currentClaim}
                  dialogue={visibleDialogue}
                  callRef={callRef}
                />
              ) : currentClaim && access ? (
                <PortalView tpa={currentClaim.tpaName} method={access.method} url={access.url} claim={currentClaim} steps={visibleSteps} />
              ) : null}
            </div>
          </div>

          {/* RIGHT: Context + Decisions */}
          <div className="col-span-3 flex flex-col">
            <div className="px-4 py-2.5 border-b border-[#1E293B] flex items-center gap-2">
              <Shield size={14} className="text-amber-400" />
              <span className="font-mono text-[11px] text-[#94A3B8]">Claim Context</span>
            </div>
            {currentClaim && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-[#161B22] rounded border border-[#21262D] p-3 space-y-2">
                  <p className="font-mono text-xs text-white">{currentClaim.claimNo}</p>
                  <div className="space-y-1 text-[10px] font-mono">
                    <KV label="Patient" value={currentClaim.patientName} />
                    <KV label="TPA" value={currentClaim.tpaName} />
                    <KV label="Amount" value={`RM ${currentClaim.grossAmountRm.toFixed(2)}`} vc="text-white" />
                    <KV label="Outstanding" value={`${currentClaim.daysOutstanding} days`} vc={currentClaim.daysOutstanding > 60 ? 'text-red-400' : 'text-amber-400'} />
                    <KV label="Connector" value={access?.method.toUpperCase() ?? '?'} />
                    <KV label="Check #" value={String(currentClaim.checkCount + 1)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">Decision Trace</p>
                  {visibleSteps.filter((s) => ['response', 'decision', 'log'].includes(s.type)).map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="bg-[#161B22] rounded border border-[#21262D] p-2.5">
                      <span className={`text-[9px] font-mono ${step.type === 'response' ? 'text-emerald-400' : step.type === 'decision' ? 'text-amber-300' : 'text-green-400'}`}>{step.agent}</span>
                      <p className="font-mono text-[9px] text-[#94A3B8] mt-0.5">{step.action}</p>
                      <p className="font-mono text-[9px] text-[#64748B] mt-0.5 whitespace-pre-wrap">{step.detail}</p>
                    </motion.div>
                  ))}
                </div>

                {completedClaims.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">Completed</p>
                    {completedClaims.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#94A3B8]">{c.claimNo}</span>
                        <span className={c.outcome === 'promised_date' ? 'text-teal-400' : c.outcome === 'approved' ? 'text-emerald-400' : c.outcome === 'no_response' ? 'text-red-400' : 'text-amber-400'}>{c.outcome.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-5 py-2.5 border-t border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#64748B]">
            <span className="flex items-center gap-1"><motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} /> StatusAgent</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> DecisionAgent</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> LogAgent</span>
            {isInVoiceCall && <span className="flex items-center gap-1 text-emerald-400"><Phone size={10} /> VoiceAgent LIVE</span>}
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">Queue: {claims.length} claims {'\u2022'} RM {claims.reduce((s, c) => s + c.grossAmountRm, 0).toLocaleString()}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Helper ───
function KV({ label, value, vc = 'text-[#94A3B8]' }: { label: string; value: string; vc?: string }) {
  return <div className="flex justify-between"><span className="text-[#64748B]">{label}</span><span className={vc}>{value}</span></div>;
}

// ─── Voice Call View (with dialogue bubbles + waveform) ───
function VoiceCallView({ tpa, url, claim, dialogue, callRef }: {
  tpa: string; url: string; claim: ClaimCheckEntry; dialogue: DialogueLine[];
  callRef: React.RefObject<HTMLDivElement | null>;
}) {
  const lastLine = dialogue[dialogue.length - 1];
  const isSpeaking = !!lastLine && (lastLine.speaker === 'agent' || lastLine.speaker === 'operator');
  const callDuration = dialogue.length * 2; // approximate

  return (
    <div className="flex-1 flex flex-col bg-[#0A0E14]">
      {/* Call header */}
      <div className="px-4 py-3 border-b border-[#1E293B] bg-[#161B22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Phone size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-mono text-sm text-white">{tpa} Claims Dept</p>
              <p className="font-mono text-[10px] text-[#64748B]">{url}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-emerald-400">CONNECTED</p>
            <p className="font-mono text-[10px] text-[#64748B]">{Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}</p>
          </div>
        </div>

        {/* Audio waveform */}
        <div className="mt-3 flex items-center gap-0.5 h-6 justify-center">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${isSpeaking ? (lastLine?.speaker === 'agent' ? 'bg-teal-400' : 'bg-emerald-400') : 'bg-[#21262D]'}`}
              animate={isSpeaking ? {
                height: [4, 8 + Math.random() * 16, 4],
              } : { height: 4 }}
              transition={{
                duration: 0.3 + Math.random() * 0.3,
                repeat: isSpeaking ? Infinity : 0,
                delay: i * 0.02,
              }}
            />
          ))}
        </div>
        {isSpeaking && (
          <div className="flex items-center justify-center gap-2 mt-1.5">
            {lastLine?.speaker === 'agent' ? (
              <span className="flex items-center gap-1 text-[9px] font-mono text-teal-400"><Mic size={10} /> ClinicMate Agent speaking</span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400"><Volume2 size={10} /> {tpa} operator speaking</span>
            )}
          </div>
        )}
      </div>

      {/* Dialogue */}
      <div ref={callRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {dialogue.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${line.speaker === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            {line.speaker === 'system' ? (
              <div className="text-center w-full">
                <span className="inline-block font-mono text-[9px] text-[#475569] bg-[#161B22] px-3 py-1 rounded-full">
                  {line.text}
                </span>
              </div>
            ) : (
              <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                line.speaker === 'agent'
                  ? 'bg-teal-900/40 border border-teal-800/50'
                  : 'bg-[#161B22] border border-[#21262D]'
              }`}>
                <p className={`font-mono text-[8px] mb-0.5 ${line.speaker === 'agent' ? 'text-teal-400' : 'text-emerald-400'}`}>
                  {line.speaker === 'agent' ? 'ClinicMate Agent' : `${tpa} Operator`}
                </p>
                <p className="font-mono text-[10px] text-[#C9D1D9] leading-relaxed">{line.text}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Portal / App / Terminal views ───
function PortalView({ tpa, method, url, claim, steps }: {
  tpa: string; method: string; url: string; claim: ClaimCheckEntry; steps: (AgentStep & { done: boolean })[];
}) {
  const connectStep = steps.find((s) => s.type === 'connect');
  const inputStep = steps.find((s) => s.type === 'input');
  const waitStep = steps.find((s) => s.type === 'waiting');
  const responseStep = steps.find((s) => s.type === 'response');
  const hasConnected = !!connectStep;
  const hasInput = !!inputStep;
  const isWaiting = waitStep && !waitStep.done;
  const hasResponse = !!responseStep;

  if (method === 'portal') return <BrowserSim tpa={tpa} url={url} claim={claim} hasConnected={hasConnected} hasInput={hasInput} isWaiting={!!isWaiting} hasResponse={hasResponse} responseStep={responseStep} />;
  if (method === 'app') return <AppSim tpa={tpa} claim={claim} hasConnected={hasConnected} hasInput={hasInput} isWaiting={!!isWaiting} hasResponse={hasResponse} responseStep={responseStep} />;
  return <TerminalSim tpa={tpa} url={url} claim={claim} steps={steps} />;
}

function BrowserSim({ tpa, url, claim, hasConnected, hasInput, isWaiting, hasResponse, responseStep }: {
  tpa: string; url: string; claim: ClaimCheckEntry; hasConnected: boolean; hasInput: boolean; isWaiting: boolean; hasResponse: boolean; responseStep?: AgentStep & { done: boolean };
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0E14]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="w-2 h-2 rounded-full bg-emerald-500" /></div>
        <div className="flex-1 bg-[#0D1117] rounded px-2 py-0.5 font-mono text-[10px] text-[#64748B] flex items-center gap-1"><span className="text-emerald-500">{'\uD83D\uDD12'}</span> https://{url}</div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {!hasConnected && <div className="space-y-2"><div className="h-6 w-32 bg-[#161B22] rounded animate-pulse" /><div className="h-8 w-full bg-[#161B22] rounded animate-pulse" /><div className="h-8 w-full bg-[#161B22] rounded animate-pulse" /></div>}
        {hasConnected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-3"><span className="font-mono text-[10px] text-emerald-400">{'\u2713'} Authenticated</span><span className="font-mono text-[9px] text-[#475569]">ClinicMate_vani@***</span></div>
            <div className="flex gap-2 mb-3 text-[10px] font-mono"><span className="text-[#475569] px-2 py-1 rounded bg-[#161B22]">Dashboard</span><span className="text-white px-2 py-1 rounded bg-teal-800/50 border border-teal-700/50">Claims</span><span className="text-[#475569] px-2 py-1 rounded bg-[#161B22]">Reports</span></div>
            <div className="bg-[#161B22] rounded border border-[#21262D] p-2 mb-3">
              <p className="font-mono text-[9px] text-[#475569] mb-1">Claim Reference Search</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0D1117] rounded px-2 py-1 font-mono text-[10px] text-white border border-[#21262D]">
                  {hasInput ? claim.claimNo : ''}{!hasInput && <motion.span className="text-teal-400" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}
                </div>
                <button className={`px-2 py-1 rounded text-[9px] font-mono ${hasInput ? 'bg-teal-600 text-white' : 'bg-[#21262D] text-[#475569]'}`}>Search</button>
              </div>
            </div>
            {isWaiting && <div className="flex items-center gap-2 py-4 justify-center"><Loader2 size={14} className="text-teal-400 animate-spin" /><span className="font-mono text-[10px] text-[#64748B]">Querying {tpa} database...</span></div>}
            {hasResponse && responseStep && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161B22] rounded border border-[#21262D] p-3">
                <div className="flex items-center gap-2 mb-2"><span className="font-mono text-[9px] text-[#475569]">CLAIM STATUS</span><span className="font-mono text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{responseStep.action.split(': ')[1]}</span></div>
                <p className="font-mono text-[10px] text-[#94A3B8] leading-relaxed">{responseStep.detail}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AppSim({ tpa, claim, hasConnected, hasInput, isWaiting, hasResponse, responseStep }: {
  tpa: string; claim: ClaimCheckEntry; hasConnected: boolean; hasInput: boolean; isWaiting: boolean; hasResponse: boolean; responseStep?: AgentStep & { done: boolean };
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#0A0E14] items-center py-6">
      <div className="w-52 bg-[#161B22] rounded-2xl border border-[#21262D] overflow-hidden shadow-2xl">
        <div className="flex justify-between px-3 py-1 text-[8px] font-mono text-[#475569]"><span>2:37 PM</span><span>5G {'\u2022'} 100%</span></div>
        <div className="bg-teal-800/30 px-3 py-2 text-center"><p className="font-mono text-[10px] text-white font-medium">{tpa}</p><p className="font-mono text-[8px] text-[#64748B]">Provider Portal</p></div>
        <div className="px-3 py-2 space-y-2 min-h-[180px]">
          {!hasConnected && <div className="flex flex-col items-center py-6"><Loader2 size={18} className="text-teal-400 animate-spin mb-2" /><p className="font-mono text-[8px] text-[#475569]">Authenticating...</p></div>}
          {hasConnected && !hasInput && <div className="space-y-1.5"><div className="h-3 w-full bg-[#21262D] rounded animate-pulse" /><div className="h-3 w-3/4 bg-[#21262D] rounded animate-pulse" /></div>}
          {hasInput && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="font-mono text-[8px] text-[#475569]">Claim Lookup</p>
              <div className="bg-[#0D1117] rounded px-2 py-1.5 font-mono text-[9px] text-white border border-[#21262D]">{claim.claimNo}</div>
              {isWaiting && <div className="h-2 w-full bg-teal-600/30 rounded overflow-hidden"><motion.div className="h-full bg-teal-400 rounded" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity }} /></div>}
              {hasResponse && responseStep && <div className="bg-emerald-900/20 border border-emerald-800/30 rounded p-2"><p className="font-mono text-[8px] text-emerald-400 leading-relaxed">{responseStep.detail.slice(0, 100)}</p></div>}
            </motion.div>
          )}
        </div>
        <div className="flex justify-around px-2 py-2 border-t border-[#21262D] text-[8px] font-mono text-[#475569]"><span>Home</span><span className="text-teal-400">Claims</span><span>Profile</span></div>
      </div>
    </div>
  );
}

function TerminalSim({ tpa, url, steps }: {
  tpa: string; url: string; claim: ClaimCheckEntry; steps: (AgentStep & { done: boolean })[];
}) {
  return (
    <div className="flex-1 bg-[#0A0E14] p-4 overflow-y-auto font-mono text-[10px]">
      <p className="text-[#475569] mb-1"># StatusAgent {'\u2022'} {tpa} API Connector</p>
      <p className="text-[#475569] mb-3">$ curl -X POST https://{url}</p>
      {steps.filter((s) => ['connect', 'input', 'waiting', 'response', 'decision', 'log'].includes(s.type)).map((step, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-1.5">
          {step.type === 'connect' && <p className="text-blue-400">&gt; {step.detail.replace(/\n/g, '\n> ')}</p>}
          {step.type === 'input' && <p className="text-cyan-400 whitespace-pre-wrap">&gt; {step.detail}</p>}
          {step.type === 'waiting' && <p className="text-amber-400">{step.done ? step.detail : <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>Waiting for response...</motion.span>}</p>}
          {step.type === 'response' && <p className="text-emerald-400">&lt; 200 OK{'\n'}&lt; {step.detail}</p>}
          {(step.type === 'decision' || step.type === 'log') && <p className="text-[#64748B]">// {step.action}</p>}
        </motion.div>
      ))}
    </div>
  );
}
