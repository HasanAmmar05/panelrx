import { motion } from 'framer-motion';

const PARTICLE_COUNT = 12;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${(i * 8.3 + 3) % 100}%`,
  size: 2 + (i % 3),
  duration: 8 + (i % 5) * 1.2,
  delay: i * 0.7,
  opacity: 0.08 + (i % 3) * 0.05,
}));

export function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
          }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
