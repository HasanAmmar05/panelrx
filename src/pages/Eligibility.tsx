import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, Shield, User } from 'lucide-react';
import { getEligibilityResults, PATIENTS, type EligibilityCheckResult } from '../data/seed';
import { formatRM } from '../lib/utils';

type CheckState = 'idle' | 'checking' | 'done';

/** Malaysian IC: last digit odd = male, even = female */
function genderFromIc(ic: string): 'Male' | 'Female' | null {
  const digits = ic.replace(/\D/g, '');
  if (digits.length < 12) return null;
  const last = parseInt(digits[digits.length - 1], 10);
  return last % 2 === 1 ? 'Male' : 'Female';
}

/** Parse DOB from IC (first 6 digits = YYMMDD) */
function dobFromIc(ic: string): string | null {
  const digits = ic.replace(/\D/g, '');
  if (digits.length < 6) return null;
  const yy = parseInt(digits.slice(0, 2), 10);
  const mm = digits.slice(2, 4);
  const dd = digits.slice(4, 6);
  const year = yy > 30 ? 1900 + yy : 2000 + yy;
  return `${year}-${mm}-${dd}`;
}

/** Parse state code from IC (digits 7-8) */
const STATE_CODES: Record<string, string> = {
  '01': 'Johor', '02': 'Kedah', '03': 'Kelantan', '04': 'Melaka',
  '05': 'Negeri Sembilan', '06': 'Pahang', '07': 'Pulau Pinang', '08': 'Perak',
  '09': 'Perlis', '10': 'Selangor', '11': 'Terengganu', '12': 'Sabah',
  '13': 'Sarawak', '14': 'W.P. Kuala Lumpur', '15': 'W.P. Labuan', '16': 'W.P. Putrajaya',
};

function stateFromIc(ic: string): string | null {
  const digits = ic.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const code = digits.slice(6, 8);
  return STATE_CODES[code] ?? null;
}

function formatDob(dob: string): string {
  try {
    const d = new Date(dob + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export function Eligibility() {
  const [ic, setIc] = useState('920101-10-1233');
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [results, setResults] = useState<EligibilityCheckResult[]>([]);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allResultsRef = useRef<EligibilityCheckResult[]>([]);
  const idxRef = useRef(0);

  const patient = PATIENTS.find((p) => p.icNumber === ic);
  const gender = genderFromIc(ic);
  const dob = dobFromIc(ic);
  const birthState = stateFromIc(ic);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function runCheck() {
    if (!ic.trim()) return;

    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setCheckState('checking');
    setResults([]);
    setProgress(0);

    const allResults = getEligibilityResults(ic);
    allResultsRef.current = allResults;
    idxRef.current = 0;

    function addNext() {
      const idx = idxRef.current;
      if (idx >= allResultsRef.current.length) {
        setCheckState('done');
        return;
      }

      setResults((prev) => [...prev, allResultsRef.current[idx]]);
      setProgress(((idx + 1) / allResultsRef.current.length) * 100);
      idxRef.current = idx + 1;

      timerRef.current = setTimeout(addNext, 600);
    }

    // Start after a brief delay
    timerRef.current = setTimeout(addNext, 400);
  }

  const activeResults = results.filter((r) => r.status === 'active');
  const highestLimit = activeResults.length > 0
    ? Math.max(...activeResults.map((r) => r.remainingLimitRm ?? 0))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Eligibility Check</h2>
        <p className="text-body text-sm mt-1">
          Verify patient coverage across all panels simultaneously
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={ic}
              onChange={(e) => setIc(e.target.value)}
              placeholder="Enter IC Number (e.g. 920101-10-1233)"
              className="w-full pl-9 pr-4 py-3 rounded-md bg-background border border-border text-ink font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && runCheck()}
            />
          </div>
          <button
            onClick={runCheck}
            disabled={checkState === 'checking'}
            className="bg-primary text-white hover:bg-primary-deep disabled:opacity-60 px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 shrink-0"
            type="button"
          >
            {checkState === 'checking' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield size={16} />
                Check all 6 panels
              </>
            )}
          </button>
        </div>

        {/* IC Decoded info */}
        {ic.replace(/\D/g, '').length >= 12 && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {patient && (
              <span className="text-positive font-mono flex items-center gap-1">
                <User size={12} />
                {patient.fullName}
              </span>
            )}
            {gender && (
              <span className="font-mono text-body px-2 py-0.5 rounded bg-surface-elevated border border-border">
                {gender === 'Male' ? '\u2642' : '\u2640'} {gender}
              </span>
            )}
            {dob && formatDob(dob) && (
              <span className="font-mono text-muted">
                DOB: {formatDob(dob)}
              </span>
            )}
            {birthState && (
              <span className="font-mono text-muted">
                Birth: {birthState}
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {checkState === 'checking' && (
          <div className="mt-3 h-1 rounded-full bg-surface-elevated overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r, i) => (
            <motion.div
              key={r.payerId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-surface border rounded-lg p-4 ${
                r.status === 'active' ? 'border-positive/30' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-sm font-medium text-ink">{r.tpaName}</span>
                {r.status === 'active' ? (
                  <span className="flex items-center gap-1 text-xs text-positive font-medium">
                    <CheckCircle size={14} />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted font-medium">
                    <XCircle size={14} />
                    Not covered
                  </span>
                )}
              </div>

              {r.status === 'active' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Plan</span>
                    <span className="font-mono text-body">{r.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Remaining limit</span>
                    <span className="font-display tabular-nums text-ink font-medium">
                      {formatRM(r.remainingLimitRm ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Visit cap</span>
                    <span className="font-mono text-body">{formatRM(r.visitCapRm ?? 0)}</span>
                  </div>
                  {(r.copayRm ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">Co-pay</span>
                      <span className="font-mono text-amber">{formatRM(r.copayRm ?? 0)}</span>
                    </div>
                  )}
                  {r.notes && (
                    <p className="text-muted mt-1 pt-2 border-t border-border">{r.notes}</p>
                  )}
                </div>
              )}

              {r.status === 'not_covered' && r.notes && (
                <p className="text-xs text-muted">{r.notes}</p>
              )}

              <p className="text-[10px] text-muted font-mono mt-2 text-right">{r.latencyMs}ms</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      {checkState === 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-positive-soft border border-positive/20 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle size={20} className="text-positive shrink-0" />
          <div>
            <p className="text-sm text-ink font-medium">
              {activeResults.length} active panels found for IC {ic}
              {gender ? ` \u00b7 ${gender}` : ''}
            </p>
            <p className="text-xs text-body mt-0.5">
              {activeResults.length > 0
                ? `Highest limit: ${formatRM(highestLimit)} \u00b7 Ready to proceed to claim submission`
                : 'No active coverage found. Patient may need to pay out-of-pocket.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
