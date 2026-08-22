'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, Activity } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

import { cn } from '@/lib/utils';
import { Button } from '@/components/landing-ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/landing-ui/sheet';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For patients', href: '#patients' },
  { label: 'For doctors', href: '#doctors' },
  { label: 'Security', href: '#security' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'landing-navbar fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/95 shadow-soft'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            CareFlow
          </span>
        </Link>

        {/* Center nav */}
        <div className="nav-center hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="nav-actions flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex flex-shrink-0"
          >
            <Link href="/app">Sign in</Link>
          </Button>

          <Button size="sm" asChild className="hidden sm:inline-flex flex-shrink-0">
            <Link href="/app">Get started</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-1 pt-6">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <SheetClose asChild>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/app">Sign in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button size="sm" asChild>
                      <Link href="/app">Get started</Link>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
