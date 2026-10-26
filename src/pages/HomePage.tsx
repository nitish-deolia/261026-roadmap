import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { TinyLabel } from "../components/TinyLabel";
import { roadmapProgress } from "../storage";
import type { Roadmap } from "../types";

export function HomePage({ roadmaps }: { roadmaps: Roadmap[] }) {
  const primaryRoadmap = roadmaps[0];
  const primaryProgress = primaryRoadmap
    ? roadmapProgress(primaryRoadmap)
    : { done: 0, total: 0, percent: 0 };

  const overallProgress = roadmaps.map(roadmapProgress);
  const completedCount = overallProgress.reduce((sum, item) => sum + item.done, 0);
  const milestoneCount = overallProgress.reduce((sum, item) => sum + item.total, 0);
  const overallPercent = milestoneCount
    ? Math.round((completedCount * 100) / milestoneCount)
    : 0;

  return (
    <main>
      <section className="hero home-hero">
        <div className="hero-copy">
          <TinyLabel>Build your next chapter</TinyLabel>
          <h1>Small steps.<br /><span>Big systems.</span></h1>
          <p>
            A home for ambitious roadmaps, practical milestones, and the work
            you’re building toward.
          </p>
          <div className="hero-actions">
            <Link className="button button-lime" to="/roadmaps">
              Explore roadmaps <Icon name="arrow" />
            </Link>
            <Link className="text-link" to="/roadmaps/dotnet-to-ai-architect">
              Continue your AI journey <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-label="Six connected learning milestones">
          <div className="orbit orbit-large" />
          <div className="orbit orbit-small" />
          <div className="orbit-core"><Icon name="spark" /></div>
          <div className="orbit-node node-a">.NET</div>
          <div className="orbit-node node-b">RAG</div>
          <div className="orbit-node node-c">SHIP</div>
          <div className="orbit-caption">BUILD<br /><b>WITH INTENT</b></div>
        </div>
      </section>

      <section className="home-overview" aria-label="Learning snapshot">
        <div className="overview-note">
          <div className="overview-icon"><Icon name="book" /></div>
          <div>
            <strong>{roadmaps.length} roadmap{roadmaps.length === 1 ? "" : "s"}</strong>
            <span>One focused place to grow</span>
          </div>
        </div>
        <div className="overview-progress">
          <div className="overview-label">
            <span>Your progress</span>
            <strong>{completedCount}<small> / {milestoneCount} milestones</small></strong>
          </div>
          <ProgressBar percent={overallPercent} label="Overall learning progress" />
        </div>
        <div className="overview-pace">
          <span className="pace-spark">✳</span>
          <div>
            <strong>Go at your pace</strong>
            <span>No streaks. Just forward.</span>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-intro">
          <div>
            <TinyLabel>Featured path</TinyLabel>
            <h2>Your next big build</h2>
          </div>
          <Link className="text-link" to="/roadmaps">All roadmaps <span>↗</span></Link>
        </div>

        {primaryRoadmap ? (
          <Link className="feature-card" to={`/roadmaps/${primaryRoadmap.slug}`}>
            <div className="feature-art">
              <span className="feature-glow" />
              <span className="feature-index">01 <i>— 06</i></span>
              <div className="feature-rings"><span /><span /><span /><b>AI</b></div>
              <span className="feature-stamp">C# <i>+</i> AI</span>
            </div>
            <div className="feature-content">
              <div className="card-meta">
                <span className="pill pill-lime">{primaryRoadmap.category}</span>
                <span>{primaryRoadmap.duration}</span>
              </div>
              <h3>{primaryRoadmap.shortTitle}</h3>
              <p>{primaryRoadmap.description}</p>
              <div className="feature-bottom">
                <div className="feature-progress">
                  <div className="progress-caption">
                    <span>{primaryProgress.done} of {primaryProgress.total} milestones</span>
                    <strong>{primaryProgress.percent}%</strong>
                  </div>
                  <ProgressBar percent={primaryProgress.percent} />
                </div>
                <span className="round-arrow"><Icon name="arrow" /></span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="empty-state">Your first roadmap will show up here.</div>
        )}
      </section>

      <section className="quote-strip">
        <span className="quote-mark">“</span>
        <p>Architects don’t just learn tools.<br /><b>They learn where the tools belong.</b></p>
        <span className="quote-tail">A principle for the journey <i>✳</i></span>
      </section>
    </main>
  );
}
