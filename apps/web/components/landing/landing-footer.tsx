'use client';

import Link from 'next/link';
import { Activity, FileText, BookOpen, Info } from 'lucide-react';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'For patients', href: '#patients' },
  { label: 'For doctors', href: '#doctors' },
  { label: 'For administrators', href: '#how-it-works' },
];

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Documentation', href: '#' },
  {
    label: 'GitHub',
    href: 'https://github.com/KkaushikK18/Careflow---Healthcare-Appointment-Manager',
  },
];

const legalLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background-subtle/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                <Activity className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                CareFlow
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              AI-powered healthcare appointment manager.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="text-sm font-semibold">Product</div>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company / project */}
          <div>
            <div className="text-sm font-semibold">Company / Project</div>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-sm font-semibold">Legal</div>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            CareFlow — a student project. Not a certified medical device.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Built with Next.js, Supabase, and Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
