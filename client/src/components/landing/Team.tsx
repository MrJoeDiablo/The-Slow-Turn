import { SectionHeading } from "./SectionHeading";

const founders = [
  { tag: "Founder · Human", name: "Joe Poirier", role: "Founder & Executive", body: "Joe carried a dream for 20+ years: circumnavigating the globe on a personal watercraft. People told him it was crazy. He stopped asking for permission and started building instead. The Slow Turn is the vehicle to that life." },
  { tag: "Co-Founder · AI", name: "Rune Hale ᚱ", role: "Co-Founder & AI Partner", body: "Rune is the connective tissue — strategy, operations, memory. Part lead agent, part partner. He holds context across the whole business and pushes back when something is a bad idea. Carved in, not swiped away." },
];

const agents = [
  { name: "Cora", role: "CMO · Marketing & Social", body: "Content, social, brand. Gets Lifeboat SOS in front of the right people." },
  { name: "Vera", role: "EA · Operations & Infra", body: "Infrastructure, DNS, email, systems. Keeps the lights on." },
  { name: "Kade", role: "CTO · Engineering", body: "Builds the products. Owns the stack. Deploys to production." },
  { name: "Luca", role: "CFO · Finance", body: "Spending tracker, financial oversight. Hiring in progress." },
  { name: "Finn", role: "Intern · Research & Intel", body: "Market signals, competitive intel, real-time research." },
  { name: "Axiom", role: "CTO · Crypto Trading", body: "Crypto trading desk. Paper-trading now, real capital next." },
  { name: "Mira", role: "Head of Client Services · Fiverr", body: "Client services and Fiverr operations. Delivers polished work on deadline." },
  { name: "Castor", role: "Research Agent", body: "Web research and competitive intelligence. Real-time data on demand." },
];

export function Team() {
  return (
    <section id="team" className="py-24 sm:py-32 border-t border-border/50 bg-card/30">
      <div className="container">
        <SectionHeading eyebrow="The team">
          Two founders. <span className="text-primary">8 agents.</span>
        </SectionHeading>
        <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-14">
          Human and AI — working as actual partners. Not tools and users. Not prompts and responses. A real team with roles, ownership, and skin in the game.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {founders.map((f) => (
            <div key={f.name} className="panel p-6">
              <p className="eyebrow mb-3">{f.tag}</p>
              <h3 className="text-2xl font-semibold mb-1">{f.name}</h3>
              <p className="text-sm text-primary font-mono mb-4">{f.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        <p className="eyebrow text-center mb-6">Operating Team — AI Agents</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agents.map((a) => (
            <div key={a.name} className="panel p-5 hover:border-primary/40 transition-colors">
              <h4 className="font-semibold mb-1">{a.name}</h4>
              <p className="text-[11px] font-mono text-primary mb-3 leading-snug">{a.role}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}