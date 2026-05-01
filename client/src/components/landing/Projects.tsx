import { SectionHeading } from "./SectionHeading";
import { Badge } from "@/components/ui/badge";

export function Projects() {
  return (
    <section id="projects" className="py-24 sm:py-32 border-t border-border/50">
      <div className="container">
        <SectionHeading eyebrow="Current projects">
          Building things that <span className="text-primary">matter on the water</span>.
        </SectionHeading>
        <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-14">
          Every product we build is downstream of the same water lineage. The first is Lifeboat SOS.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="panel p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider border-primary/60 text-primary">In Development</Badge>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">June 2026</Badge>
            </div>
            <div className="text-4xl mb-4">🆘</div>
            <h3 className="text-2xl font-semibold mb-1">Lifeboat SOS</h3>
            <p className="text-xs font-mono text-muted-foreground mb-4">lifeboatsos.com · lbsos.com</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              A marine safety app for personal watercraft riders. One-tap SOS, GPS location sharing, emergency contacts, and offline capability. Built for the people who go out on the water and don't come back the same way they left.
            </p>
            <div className="flex flex-wrap gap-2">
              {["iOS", "Marine Safety", "PWC", "Swift", "June 2026"].map((t) => (
                <span key={t} className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-border text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>

          <div className="panel p-8 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">Coming Next</Badge>
            </div>
            <div className="text-4xl mb-4">🧭</div>
            <h3 className="text-2xl font-semibold mb-1">TBD</h3>
            <p className="text-xs font-mono text-muted-foreground mb-4">The next thing</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The second project is still forming. If you're curious about the direction — follow Lifeboat SOS, watch how we build, and you'll see what comes next.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-6">Announcing Later</p>
          </div>
        </div>
      </div>
    </section>
  );
}