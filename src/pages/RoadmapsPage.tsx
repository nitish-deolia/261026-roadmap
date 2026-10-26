import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { TinyLabel } from "../components/TinyLabel";
import { roadmapProgress } from "../storage";
import type { Roadmap } from "../types";

export function RoadmapsPage({ roadmaps }: { roadmaps: Roadmap[] }) {
  return (
    <main className="inner-page">
      <div className="page-heading">
        <TinyLabel>The library</TinyLabel>
        <h1>Roadmaps for<br /><span>what’s next.</span></h1>
        <p>Focused paths with real outcomes. More journeys can join the library as you grow.</p>
      </div>

      <div className="library-toolbar">
        <span>{roadmaps.length} roadmap{roadmaps.length === 1 ? "" : "s"} <i>·</i> curated for your next move</span>
        <span className="library-decoration">EXPLORE <b>→</b></span>
      </div>

      <div className="roadmap-grid">
        {roadmaps.map((roadmap, index) => {
          const progress = roadmapProgress(roadmap);
          const artworkClass = `library-art art-${index % 3}`;

          return (
            <Link key={roadmap.id} className="library-card" to={`/roadmaps/${roadmap.slug}`}>
              <div className={artworkClass}>
                <div className="art-stamp">0{index + 1}</div>
                <div className="art-mark">
                  {roadmap.id === "dotnet-ai-architect" ? (
                    <><span>.NET</span><b>✳</b><span>AI</span></>
                  ) : (
                    <span>{roadmap.category}</span>
                  )}
                </div>
                <span className="art-arrow"><Icon name="arrow" /></span>
              </div>
              <div className="library-body">
                <div className="card-meta">
                  <span className="pill pill-mint">{roadmap.category}</span>
                  <span>{roadmap.duration}</span>
                </div>
                <h2>{roadmap.shortTitle}</h2>
                <p>{roadmap.description}</p>
                <div className="library-foot">
                  <span>{roadmap.sections.length} learning sections</span>
                  <strong>{progress.percent}% <span>complete</span></strong>
                </div>
                <ProgressBar percent={progress.percent} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="coming-note">
        <span className="coming-star">✳</span>
        <div>
          <strong>More paths, when you’re ready.</strong>
          <p>This library is designed to grow with your goals.</p>
        </div>
      </div>
    </main>
  );
}
