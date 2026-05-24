import { motion } from 'framer-motion';

type SimCursorProps = {
  x: number;
  y: number;
  clicking?: boolean;
};

export function SimCursor({ x, y, clicking = false }: SimCursorProps) {
  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      animate={{ left: x, top: y }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-primary"
        animate={{
          scale: clicking ? [1, 1.8, 1] : 1,
          opacity: clicking ? [1, 0.6, 1] : 1,
        }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}
