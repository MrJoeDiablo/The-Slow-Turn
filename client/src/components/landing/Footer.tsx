import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo className="text-muted-foreground" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} The Slow Turn · A deliberate change of course
        </p>
        <Link to="/auth" className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary hover:underline">
          Team Dashboard →
        </Link>
      </div>
    </footer>
  );
}