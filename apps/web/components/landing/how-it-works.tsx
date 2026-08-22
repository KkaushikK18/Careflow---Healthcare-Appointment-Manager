'use client';

import { UserPlus, Search, CalendarCheck, HeartPulse } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create your account',
    desc: 'Sign up as a patient, doctor, or administrator to get started with CareFlow.',
  },
  {
    num: '02',
    icon: Search,
    title: 'Find the right care',
    desc: 'Search for doctors by specialty, location, and availability — with smart recommendations.',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book and manage appointments',
    desc: 'Book with confidence, track your appointments, and receive timely updates.',
  },
  {
    num: '04',
    icon: HeartPulse,
    title: 'Continue your care journey',
    desc: 'Manage prescriptions, message your care team, and follow up — all in one place.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 bg-background-subtle/40" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-20" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From first visit to follow-up.
          </h2>
        </div>

        <div className="reveal reveal-delay-2 mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ num, icon: Icon, title, desc }, i) => (
            <div
              key={num}
              className={`reveal reveal-delay-${i + 1} relative rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-card hover:-translate-y-1`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-primary/15">{num}</span>
              </div>
              <div className="text-base font-semibold">{title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-3 h-px w-6 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
