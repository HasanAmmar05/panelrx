import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/eligibility': 'Eligibility Check',
  '/submit': 'Submit Claim',
  '/status': 'Claim Status',
  '/auto-sweep': 'Auto Sweep',
  '/reconcile': 'Reconcile',
  '/aggregate': 'MMA Aggregate',
  '/settings/connectors': 'TPA Connectors',
};

export function TopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'ClinicMate';

  return (
    <header
      className="h-14 flex items-center justify-between px-6 bg-surface-solid/80 backdrop-blur-sm border-b border-border"
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
      }}
    >
      <h1 className="font-display text-lg text-ink">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          className="relative p-2 rounded-md text-muted hover:text-ink hover:bg-surface-elevated"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-semibold flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* User avatar with status dot */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
            <span className="font-mono text-xs text-primary font-semibold">DV</span>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-positive border-2 border-surface-solid" />
        </div>
      </div>
    </header>
  );
}
