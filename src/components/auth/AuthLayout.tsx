import type { ReactNode } from 'react'
import BrandMark from '@/components/brand/BrandMark'

interface AuthLayoutProps {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
  benefits?: string[]
}

const defaultBenefits = [
  'Secure access powered by Supabase authentication.',
  'Responsive experience designed for every device.',
  'Colorful workflows that keep your creative work moving.',
]

const benefitIconStyles = [
  'border-primary/25 bg-primary/10 text-primary shadow-primary/10 group-hover:bg-primary group-hover:text-primary-foreground',
  'border-accent/70 bg-accent/40 text-foreground shadow-accent/20 group-hover:bg-accent group-hover:text-accent-foreground',
  'border-secondary/70 bg-secondary/60 text-secondary-foreground shadow-secondary/20 group-hover:bg-secondary group-hover:text-secondary-foreground',
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/20" />
      <div className="absolute -left-28 top-10 h-[min(20rem,60vw)] w-[min(20rem,60vw)] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-[min(24rem,68vw)] w-[min(24rem,68vw)] rounded-full bg-accent/60 blur-3xl" />
      <div className="absolute right-10 top-24 h-40 w-40 rounded-full bg-secondary/50 blur-3xl lg:right-20 lg:h-52 lg:w-52" />
      <div className="absolute left-1/3 top-1/3 h-40 w-40 rounded-full border border-primary/20 lg:h-56 lg:w-56" />
      <div className="absolute bottom-1/4 left-10 h-28 w-28 rounded-full border border-accent/60" />
      <div className="absolute left-16 top-28 h-3 w-3 rounded-full bg-primary/60 shadow-lg shadow-primary/30" />
      <div className="absolute bottom-24 right-24 h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/30" />
      <div className="absolute right-1/3 top-1/2 h-2.5 w-2.5 rounded-full bg-primary/50" />
    </div>
  )
}

function BenefitItem({ benefit, index }: { benefit: string; index: number }) {
  const iconStyle = benefitIconStyles[index % benefitIconStyles.length]

  return (
    <li className="group flex min-w-0 gap-3 rounded-2xl border border-border/80 bg-background/75 p-4 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card/85 hover:shadow-lg hover:shadow-primary/10">
      <div
        className={cx(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-black shadow-sm transition-colors duration-200',
          iconStyle,
        )}
        aria-hidden="true"
      >
        {index + 1}
      </div>
      <p className="min-w-0 text-sm leading-6 text-muted-foreground">{benefit}</p>
    </li>
  )
}

export default function AuthLayout({
  children,
  eyebrow = 'Colorful workspace',
  title = 'Build momentum with a secure creative workspace.',
  description = 'Sign in or create an account to manage your dashboard and profile with Renderr’s bright, dependable experience.',
  benefits = defaultBenefits,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen min-h-[100svh] overflow-x-hidden bg-background text-foreground">
      <div className="grid min-h-screen min-h-[100svh] min-w-0 grid-cols-1 md:grid-cols-2">
        <section
          className="relative hidden min-w-0 overflow-hidden border-r border-primary/15 bg-muted/20 px-8 py-8 md:flex md:flex-col md:justify-between lg:px-12 lg:py-10"
          aria-label="Renderr highlights"
        >
          <GradientMesh />

          <div className="relative z-10 min-w-0">
            <BrandMark subtitle="Creative account access" />
          </div>

          <div className="relative z-10 min-w-0 max-w-xl py-8 lg:py-10">
            <div className="mb-5 inline-flex max-w-full rounded-full border border-primary/20 bg-background/75 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm shadow-primary/10 backdrop-blur">
              <span className="truncate">{eyebrow}</span>
            </div>
            <h1 className="text-balance bg-gradient-to-br from-foreground via-primary to-foreground bg-clip-text text-4xl font-black tracking-tight text-transparent lg:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground lg:text-lg">
              {description}
            </p>

            <ul className="mt-8 grid gap-4 lg:mt-10" aria-label="Renderr benefits">
              {benefits.map((benefit, index) => (
                <BenefitItem key={benefit} benefit={benefit} index={index} />
              ))}
            </ul>
          </div>

          <div className="relative z-10 min-w-0 overflow-hidden rounded-3xl border border-primary/20 bg-background/75 p-5 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/50 blur-2xl" aria-hidden="true" />
            <div className="relative min-w-0">
              <div className="mb-4 flex gap-2" aria-hidden="true">
                <span className="h-2.5 w-10 rounded-full bg-primary shadow-sm shadow-primary/30" />
                <span className="h-2.5 w-6 rounded-full bg-accent shadow-sm shadow-accent/30" />
                <span className="h-2.5 w-14 rounded-full bg-secondary shadow-sm shadow-secondary/30" />
              </div>
              <p className="text-sm font-bold">Designed for expressive reliability</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Accessible forms, clear feedback, and colorful device-friendly layouts keep Renderr fast and dependable.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen min-h-[100svh] min-w-0 items-start justify-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/10 px-4 py-6 sm:px-6 md:items-center md:px-8 md:py-10 lg:px-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden md:hidden" aria-hidden="true">
            <div className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-20 bottom-12 h-60 w-60 rounded-full bg-accent/50 blur-3xl" />
            <div className="absolute left-1/2 top-24 h-24 w-24 -translate-x-1/2 rounded-full border border-primary/20" />
          </div>

          <div className="relative z-10 w-full min-w-0 max-w-md">
            <div className="mb-6 md:hidden">
              <BrandMark compact subtitle="Creative account access" />
            </div>

            <div className="rounded-[2rem] focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-4 focus-within:ring-offset-background">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
