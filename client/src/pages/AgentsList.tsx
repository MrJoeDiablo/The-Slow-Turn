import { Link } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { AgentCard } from "@/components/agents/AgentCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgentsList() {
  const { data: agents = [], isLoading } = useAgents();

  return (
    <div className="container py-6 sm:py-10 animate-fade-up">
      <PageHeader
        eyebrow="Roster"
        title="Agents"
        subtitle="Every agent on the operating team."
        actions={
          <Button asChild className="font-mono text-xs uppercase tracking-[0.15em]">
            <Link to="/app/agents/new"><Plus size={14} className="mr-1.5" /> New Agent</Link>
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((a) => <AgentCard key={a.id} agent={a as any} />)}
        </div>
      )}
    </div>
  );
}