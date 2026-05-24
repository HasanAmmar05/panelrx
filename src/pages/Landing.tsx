import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { LandingPreview } from './LandingPreview';

const PULSE_RING = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.4, 0, 0.4],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 px-6 md:px-16 py-12 max-w-7xl mx-auto items-center min-h-screen">
        {/* Left half */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <p className="font-mono text-xs text-primary tracking-widest uppercase">
            FOR MALAYSIAN SOLO GP CLINICS · LOVABLE VIBEATHON KL · MAY 24, 2026
          </p>

          <h1 className="font-display text-3xl md:text-5xl text-ink font-semibold leading-tight max-w-xl mt-8">
            Dr. Vani is owed RM 47,830 today. She doesn't know who took what.
          </h1>

          <p className="font-sans text-lg text-body leading-relaxed max-w-lg mt-6">
            PanelRx is an autonomous AI operations layer between the 9,600+
            solo Malaysian GP clinics and their 30+ third-party administrators.
            Eligibility, submission, follow-up, reconciliation — all handled by
            8 AI agents working as her shadow back office.
          </p>

          {/* Stats row */}
          <div className="mt-6">
            <p className="flex flex-wrap items-center gap-2 text-sm font-mono text-body">
              <span>3-6 month payment delays</span>
              <span className="text-muted">·</span>
              <span>up to 10% deducted per claim</span>
              <span className="text-muted">·</span>
              <span>RM 1.4B+ stuck industry-wide</span>
            </p>
            <p className="text-xs text-muted mt-1.5 font-mono">
              MMA, FPMPAM, CodeBlue · 2024–2026
            </p>
          </div>

          {/* THE CTA */}
          <div className="relative inline-block mt-10 self-start">
            <motion.div
              className="absolute inset-0 rounded-md border-2 border-primary"
              {...PULSE_RING}
            />
            <button
              onClick={() => navigate('/demo')}
              className="relative bg-primary text-background hover:bg-primary-deep px-8 py-5 rounded-md font-display text-lg md:text-xl font-semibold flex items-center gap-3 transition-colors"
              type="button"
            >
              <Play size={22} fill="currentColor" />
              Watch what happens when a patient walks in
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="mt-3 text-xs text-muted font-mono">
            90-second autonomous workflow · no signup · click to play
          </p>

          {/* Footer */}
          <p className="mt-12 text-xs text-muted font-mono">
            Built with Lovable · Claude Sonnet 4.6 + Haiku 4.5 on AWS
            Bedrock · Strands multi-agent · Supabase
          </p>
        </div>

        {/* Right half — live preview */}
        <div className="md:col-span-2 hidden md:block">
          <LandingPreview />
        </div>
      </div>
    </div>
  );
}
