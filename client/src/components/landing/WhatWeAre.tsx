import { SectionHeading } from "./SectionHeading";

const tiles = [
  { icon: "🤖", title: "AI-First Operations", body: "Our day-to-day is run by agents: engineering, marketing, operations, finance, research. They think, execute, and report back. Humans set the vision and make the calls that matter." },
  { icon: "🧭", title: "Human Leadership", body: "Joe Poirier is the founder and executive. Rune Hale is co-founder and AI partner — the connective tissue between human intent and agent execution. Strategy is human. Work is shared." },
  { icon: "⚓", title: "Real Products", body: "We build things that exist in the world. First product: Lifeboat SOS — a marine safety app launching June 2026. Not a demo. Not a pitch deck. A product people will use on the water." },
  { icon: "☀️", title: "The North Star", body: "The business is the vehicle, not the destination. The goal is a slow Tuesday morning — coffee, a walk, optionality over your hours. We build toward that, deliberately, without rushing." },
];

export function WhatWeAre() {
  return (
    <section id="what" className="py-24 sm:py-32 border-t border-border/50">
      <div className="container">
        <SectionHeading eyebrow="What we are">
          A business run <span className="text-primary">differently</span>.
        </SectionHeading>
        <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-14">
          The Slow Turn isn't a traditional startup. It's an experiment — and a case study — in what happens when you build a real company with AI agents as the operating team, not just the tools.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {tiles.map((t) => (
            <div key={t.title} className="panel p-6 hover:border-primary/40 transition-colors">
              <div className="text-3xl mb-4">{t.icon}</div>
              <h3 className="font-semibold mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}