import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/eligibility': 'Eligibility Check',
  '/submit': 'Submit Claim',
  '/status': 'Claim Status',
  '/reconcile': 'Reconcile',
  '/aggregate': 'MMA Aggregate',
  '/settings/connectors': 'TPA Connectors',
};

export function TopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'PanelRx';

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface-solid/50">
      <h1 className="font-display text-lg text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
          <span className="font-mono text-xs text-primary font-semibold">DV</span>
        </div>
      </div>
    </header>
  );
}
