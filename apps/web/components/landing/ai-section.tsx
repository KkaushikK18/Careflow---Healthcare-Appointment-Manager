'use client';

import {
  Sparkles,
  FileText,
  Brain,
  User,
  Stethoscope,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

const flowSteps = [
  {
    icon: User,
    label: 'Patient symptoms',
    desc: 'Patient describes symptoms in their own words before the visit.',
  },
  {
    icon: Brain,
    label: 'AI analysis',
    desc: 'Gemini-powered analysis structures the information into a clear summary.',
  },
  {
    icon: FileText,
    label: 'Structured information',
    desc: 'Symptoms, history, and medications organized for clinical review.',
  },
  {
    icon: Stethoscope,
    label: 'Doctor sees context',
    desc: 'Clinician reviews the summary and arrives prepared for the visit.',
  },
];

export function AISection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Intelligence
            </span>
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Intelligence where it actually helps.
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">
            CareFlow uses AI to assist the healthcare workflow — not to replace
            clinical judgment. It helps patients describe what they're feeling
            and helps doctors arrive prepared.
          </p>
        </div>

        {/* Flow visualization */}
        <div className="reveal reveal-delay-2 mt-16">
          <div className="grid gap-4 lg:grid-cols-4">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-card hover:-translate-y-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    Step {i + 1}
                  </div>
                  <div className="mt-1 text-base font-semibold">{step.label}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </div>

                {/* Arrow between steps */}
                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full border border-border bg-background">
                    <ArrowDown className="h-3 w-3 rotate-[-90deg] text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Honest disclaimer */}
          <div className="reveal reveal-delay-3 mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-xl border border-border bg-background-subtle/50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              AI in CareFlow assists with summarization and information
              structuring. It does not diagnose conditions, replace medical
              professionals, or make autonomous clinical decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
