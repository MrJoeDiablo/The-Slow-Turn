import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-14">
      <div className="absolute inset-0 grid-bg grid-bg-fade opacity-60" aria-hidden />
      <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden />

      <div className="container relative text-center animate-fade-up">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="hidden sm:block h-px w-12 bg-primary/40" />
          <span className="eyebrow">AI-First · Human-Led · Building Real</span>
          <span className="hidden sm:block h-px w-12 bg-primary/40" />
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[0.95]">
          The Slow <em className="not-italic text-primary">Turn</em>
        </h1>
        <p className="eyebrow mt-6 text-muted-foreground">A deliberate change of course</p>

        <p className="mt-10 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          A new kind of company — run primarily by AI agents, with human leadership setting the direction.
          We build real products, at a different pace, toward a different kind of life.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="font-mono text-xs tracking-[0.2em] uppercase">
            <a href="#what">Our Story ↓</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-mono text-xs tracking-[0.2em] uppercase border-primary/60 text-primary hover:bg-primary/10 hover:text-primary">
            <Link to="/auth">Team Dashboard →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}