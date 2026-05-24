import type { ReactNode } from 'react';
import { Brain, Search } from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { StreamingText } from '../components/StreamingText';
import { ThoughtBubble } from '../components/ThoughtBubble';
import { TPAPortalCard } from '../components/TPAPortalCard';
import { ResultCard } from '../components/ResultCard';
import { StatusBar } from '../components/StatusBar';

type SectionProps = { title: string; children: ReactNode };

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function Showcase() {
  return (
    <div className="min-h-screen bg-background text-ink p-6 md:p-10 space-y-12">
      <header className="space-y-2">
        <p className="font-mono text-[11px] text-primary uppercase tracking-[0.32em]">
          Phase 2 · Visual Vocabulary
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold">
          PanelRx Visual Vocabulary
        </h1>
        <p className="text-body max-w-xl">
          QA surface for the cinematic primitives. ClockCounter intentionally omitted
          for this session — Stage 5 uses an animated date string instead.
        </p>
      </header>

      <Section title="AgentCard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AgentCard
            icon={Brain}
            name="EligibilityAgent"
            model="Claude Sonnet 4.6"
            status="idle"
            statusText="standby"
          />
          <AgentCard
            icon={Brain}
            name="EligibilityAgent"
            model="Claude Sonnet 4.6"
            status="working"
            statusText="calling 3 panels in parallel"
            elapsedMs={4200}
          />
          <AgentCard
            icon={Brain}
            name="EligibilityAgent"
            model="Claude Sonnet 4.6"
            status="done"
            resultText="2 of 3 panels active"
          />
          <AgentCard
            icon={Brain}
            name="EligibilityAgent"
            model="Claude Sonnet 4.6"
            status="error"
            statusText="upstream timeout"
          />
        </div>
      </Section>

      <Section title="StreamingText">
        <p className="text-body text-lg">
          <StreamingText text="Patient just walked in. Let me verify his coverage." />
        </p>
      </Section>

      <Section title="ThoughtBubble">
        <div className="space-y-6">
          <ThoughtBubble speaker="staff" text="Patient just walked in. Let me verify." />
          <ThoughtBubble
            speaker="doctor"
            text="Old way: re-key into MiCare AND MediExpress."
            side="right"
          />
          <ThoughtBubble speaker="patient" text="I have MiCare and MediExpress." />
          <ThoughtBubble speaker="narrator" text="45 minutes pass." />
        </div>
      </Section>

      <Section title="TPAPortalCard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TPAPortalCard tpaName="MiCare" accessMethod="hotline" status="calling" />
          <TPAPortalCard
            tpaName="MediExpress"
            accessMethod="portal"
            status="success"
            responseText="Active · RM 800 remaining · RM 5 copay"
            latencyMs={5400}
          />
          <TPAPortalCard
            tpaName="PMCare"
            accessMethod="app"
            status="failure"
            responseText="Employee resigned 14-Feb-2026"
            latencyMs={6000}
          />
        </div>
      </Section>

      <Section title="ResultCard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultCard
            label="Collected"
            value="RM 28,470"
            valueColor="positive"
            sublabel="this month"
          />
          <ResultCard
            label="Variance"
            value="RM 1,247"
            valueColor="amber"
            sublabel="under formulary cap"
          />
          <ResultCard
            label="Unexplained"
            value="RM 312"
            valueColor="danger"
            sublabel="2 line items"
            pulse
            icon={Search}
          />
        </div>
      </Section>

      <Section title="StatusBar">
        <StatusBar
          activeAgents={['Orchestrator', 'EligibilityAgent']}
          currentAction="calling 3/3 panels"
          elapsedMs={4200}
        />
      </Section>
    </div>
  );
}
