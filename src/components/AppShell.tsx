import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "./Icon";

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Roadmap Hub home">
      <span className="brand-mark"><Icon name="spark" /></span>
      <span>Roadmap<span className="brand-light">Hub</span></span>
    </Link>
  );
}

function Header() {
  return (
    <header className="topbar">
      <Brand />
      <nav aria-label="Main navigation" className="main-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/roadmaps">Roadmaps</NavLink>
      </nav>
      <Link className="top-cta" to="/roadmaps/dotnet-to-ai-architect">
        <span>Pick up learning</span>
        <Icon name="arrow" />
      </Link>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="page-frame">
        <Header />
        {children}
        <footer className="site-footer">
          <span>Made for steady progress, not streaks.</span>
          <span className="footer-meta">ONE BUILD · SIX MONTHS · YOUR PACE</span>
        </footer>
      </div>
    </div>
  );
}
