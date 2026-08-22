'use client';

import {
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  Pill,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';

const flowNodes = [
  { icon: User, label: 'Patient', sub: 'Creates account' },
  { icon: Calendar, label: 'Appointment', sub: 'Books a slot' },
  { icon: Stethoscope, label: 'Doctor', sub: 'Reviews history' },
  { icon: ClipboardList, label: 'Consultation', sub: 'Visit & summary' },
  { icon: Pill, label: 'Prescription', sub: 'Sent to patient' },
  { icon: HeartPulse, label: 'Follow-up', sub: 'Continued care' },
];

export function PlatformOverview() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            One platform
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            One care journey. Every workflow connected.
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">
            CareFlow connects patients, doctors, and administrators through a
            single coordinated system — from the first appointment to
            ongoing follow-up care.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="reveal reveal-delay-2 mt-16">
          {/* Desktop horizontal flow */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="relative grid grid-cols-6 gap-4">
                {flowNodes.map(({ icon: Icon, label, sub }, i) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1">
                      <Icon className="h-8 w-8 text-primary" />
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                    {i < flowNodes.length - 1 && (
                      <ArrowRight className="absolute top-10 -right-2 h-4 w-4 text-primary/40" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile vertical flow */}
          <div className="lg:hidden">
            <div className="relative space-y-4">
              <div className="absolute bottom-4 left-12 top-4 w-px bg-gradient-to-b from-border via-border to-transparent" />
              {flowNodes.map(({ icon: Icon, label, sub }, i) => (
                <div key={label} className="relative flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-soft">
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
