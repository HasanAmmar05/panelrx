import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type ValueColor = 'amber' | 'danger' | 'positive' | 'primary' | 'ink';

const VALUE_COLOR: Record<ValueColor, string> = {
  amber: 'text-amber',
  danger: 'text-danger',
  positive: 'text-positive',
  primary: 'text-primary',
  ink: 'text-ink',
};

const PULSE_RGB: Record<ValueColor, string> = {
  amber: '245, 158, 11',
  danger: '239, 68, 68',
  positive: '16, 185, 129',
  primary: '20, 184, 166',
  ink: '248, 250, 252',
};

type ResultCardProps = {
  label: string;
  value: string;
  valueColor?: ValueColor;
  sublabel?: string;
  icon?: LucideIcon;
  pulse?: boolean;
};

export function ResultCard({
  label,
  value,
  valueColor = 'ink',
  sublabel,
  icon: Icon,
  pulse = false,
}: ResultCardProps) {
  const rgb = PULSE_RGB[valueColor];
  return (
    <motion.div
      className="relative rounded-lg border border-border bg-surface p-6 min-w-64"
      animate={
        pulse
          ? {
              boxShadow: [
                `0 0 0 0 rgba(${rgb}, 0.4)`,
                `0 0 0 8px rgba(${rgb}, 0)`,
                `0 0 0 0 rgba(${rgb}, 0)`,
              ],
            }
          : undefined
      }
      transition={pulse ? { duration: 2, repeat: Infinity, ease: 'easeOut' } : undefined}
    >
      <div className="flex items-start justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
        {Icon && <Icon size={20} className={VALUE_COLOR[valueColor]} />}
      </div>
      <p
        className={`font-display text-5xl font-semibold tabular-nums mt-2 ${VALUE_COLOR[valueColor]}`}
      >
        {value}
      </p>
      {sublabel && <p className="text-body text-sm mt-2">{sublabel}</p>}
    </motion.div>
  );
}
