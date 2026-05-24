import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileCheck,
  Send,
  Clock,
  Upload,
  Globe,
  Settings,
  Menu,
  X,
  Radar,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/eligibility', icon: FileCheck, label: 'Eligibility' },
  { to: '/submit', icon: Send, label: 'Submit claim' },
  { to: '/status', icon: Clock, label: 'Status' },
  { to: '/auto-sweep', icon: Radar, label: 'Auto Sweep' },
  { to: '/reconcile', icon: Upload, label: 'Reconcile' },
  { to: '/aggregate', icon: Globe, label: 'Aggregate' },
  { to: '/settings/connectors', icon: Settings, label: 'Connectors' },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-surface border border-border"
        type="button"
        aria-label="Open navigation"
      >
        <Menu size={20} className="text-ink" />
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-background/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-60 border-r border-border flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFB 100%)',
        }}
      >
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-primary font-semibold">ClinicMate</h2>
            <p className="font-mono text-xs text-muted">Klinik Dr Vani</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 text-muted"
            type="button"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-body hover:text-ink hover:bg-surface-elevated'
                }`}
              >
                {/* Animated active accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-accent"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <motion.span
                  className="inline-flex"
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <item.icon size={18} />
                </motion.span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <p className="font-mono text-[10px] text-muted">Pilot v0.1 · Vibeathon KL</p>
          <p className="flex items-center gap-1 font-mono text-[10px] text-positive mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-positive" />
            6 panels connected
          </p>
        </div>
      </aside>
    </>
  );
}
