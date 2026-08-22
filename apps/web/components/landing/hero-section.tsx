'use client';

import Link from 'next/link';
import {
  Activity,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Pill,
  Bell,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/landing-ui/button';
import { Badge } from '@/components/landing-ui/badge';
import { cn } from '@/lib/utils';

const trustIndicators = [
  { icon: ShieldCheck, label: 'Secure' },
  { icon: Sparkles, label: 'AI-assisted' },
  { icon: ShieldCheck, label: 'Role-based' },
  { icon: Activity, label: 'Accessible' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" aria-hidden />
      <div className="absolute inset-0 gradient-mesh" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left column */}
          <div className="reveal">
            <Badge
              variant="outline"
              className="mb-5 gap-1.5 border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Intelligent Healthcare Management
            </Badge>

            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Healthcare,{' '}
              <span className="gradient-text">connected around you.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              CareFlow brings appointments, communication, prescriptions,
              and intelligent AI-assisted care coordination into one
              connected platform — for patients, doctors, and
              administrators.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild className="h-12 px-6 text-base">
                <Link href="/app">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-6 text-base"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              {trustIndicators.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — product mockup */}
          <div className="reveal reveal-delay-2 relative">
            <HeroProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroProductMockup() {
  return (
    <div className="relative">
      {/* Glow behind */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-2xl" aria-hidden />

      {/* Main dashboard surface */}
      <div className="relative rounded-2xl border border-border bg-card shadow-float overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-background-subtle/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/40" />
            <div className="h-3 w-3 rounded-full bg-warning/50" />
            <div className="h-3 w-3 rounded-full bg-success/50" />
          </div>
          <div className="ml-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">CareFlow — Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Dashboard body */}
        <div className="grid grid-cols-3 gap-3 p-4">
          {/* Left sidebar */}
          <div className="col-span-1 space-y-2">
            <div className="rounded-lg bg-background-subtle/60 p-2.5">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
                  <Activity className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
              {[
                { icon: Calendar, label: 'Appointments', active: true },
                { icon: Stethoscope, label: 'Find doctor' },
                { icon: Pill, label: 'Medications' },
                { icon: Activity, label: 'Care pulse' },
              ].map(({ icon: Icon, label, active }) => (
                <div
                  key={label}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-2 space-y-3">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Good morning, Alex</div>
                <div className="text-xs text-muted-foreground">
                  You have 1 upcoming appointment
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success" />
                On track
              </Badge>
            </div>

            {/* Appointment card */}
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-soft">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Stethoscope className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Dr. Sarah Chen</div>
                    <div className="text-[11px] text-muted-foreground">
                      Cardiology
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/20 bg-primary/5 text-primary"
                >
                  Confirmed
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Thu, Aug 28
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  10:30 AM
                </span>
              </div>
            </div>

            {/* Care pulse + medication row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">Care pulse</span>
                </div>
                <div className="flex items-end gap-1 h-10">
                  {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-primary/20"
                      style={{ height: `${h}%` }}
                    >
                      <div
                        className="h-full rounded-sm gradient-primary opacity-70"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground">
                  Steady this week
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Pill className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">Medications</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Lisinopril</span>
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Taken
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Metformin</span>
                    <span className="flex items-center gap-1 text-warning">
                      <Clock className="h-3 w-3" />
                      6:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="text-xs font-semibold mb-2">Recent activity</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ChevronRight className="h-3 w-3 text-primary" />
                  Prescription updated by Dr. Chen
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ChevronRight className="h-3 w-3 text-primary" />
                  Message from your care team
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI insight panel */}
      <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-xl border border-border bg-card p-3.5 shadow-float animate-float sm:block lg:-left-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold">AI pre-visit summary</span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Patient reports fatigue and mild chest discomfort. Relevant history
          and medications summarized for clinician review.
        </p>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-primary">
          <Sparkles className="h-3 w-3" />
          Generated for Dr. Chen
        </div>
      </div>

      {/* Floating appointment confirmation */}
      <div className="absolute -top-4 -right-2 hidden rounded-xl border border-border bg-card p-3 shadow-float sm:block lg:-right-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <div>
            <div className="text-xs font-semibold">Appointment booked</div>
            <div className="text-[10px] text-muted-foreground">
              No conflicts detected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
