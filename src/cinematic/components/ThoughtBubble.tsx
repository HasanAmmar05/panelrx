import {
  MessageSquareDashed,
  Stethoscope,
  User,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StreamingText } from './StreamingText';

type Speaker = 'staff' | 'doctor' | 'patient' | 'narrator';

const ICONS: Record<Speaker, LucideIcon> = {
  staff: UserCheck,
  doctor: Stethoscope,
  patient: User,
  narrator: MessageSquareDashed,
};

type ThoughtBubbleProps = {
  speaker: Speaker;
  text: string;
  side?: 'left' | 'right';
  streaming?: boolean;
  streamSpeedMs?: number;
};

export function ThoughtBubble({
  speaker,
  text,
  side = 'left',
  streaming = false,
  streamSpeedMs,
}: ThoughtBubbleProps) {
  const Icon = ICONS[speaker];
  const isLeft = side === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`flex items-end gap-3 ${isLeft ? '' : 'flex-row-reverse'}`}
    >
      <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-body shrink-0">
        <Icon size={18} />
      </div>
      <div className="relative bg-surface-elevated px-4 py-3 rounded-2xl max-w-md">
        <span
          className={`absolute bottom-3 ${isLeft ? '-left-2' : '-right-2'} w-2 h-3`}
          style={{
            background: 'inherit',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            clipPath: isLeft
              ? 'polygon(100% 0, 100% 100%, 0 50%)'
              : 'polygon(0 0, 0 100%, 100% 50%)',
          }}
          aria-hidden
        />
        <p className="text-body font-sans text-base">
          {streaming ? (
            <StreamingText text={text} speedMs={streamSpeedMs} />
          ) : (
            text
          )}
        </p>
      </div>
    </motion.div>
  );
}
