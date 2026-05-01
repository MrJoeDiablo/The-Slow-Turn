import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#what", label: "About" },
  { href: "#team", label: "Team" },
  { href: "#projects", label: "Projects" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="container flex items-center justify-between h-14">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-primary transition-colors">{l.label}</a>
          ))}
          <Button asChild variant="outline" size="sm" className="font-mono text-xs tracking-[0.2em] uppercase border-primary/60 text-primary hover:bg-primary/10 hover:text-primary">
            <Link to="/auth">Dashboard →</Link>
          </Button>
        </nav>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="container py-4 flex flex-col gap-4 font-mono text-xs tracking-[0.2em] uppercase">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-muted-foreground hover:text-primary">{l.label}</a>
            ))}
            <Button asChild variant="outline" size="sm" className="font-mono text-xs tracking-[0.2em] uppercase border-primary/60 text-primary justify-center">
              <Link to="/auth">Dashboard →</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}