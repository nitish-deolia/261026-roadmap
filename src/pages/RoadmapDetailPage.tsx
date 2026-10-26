import { useRef, useState, type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { TinyLabel } from "../components/TinyLabel";
import { SectionCard } from "../components/roadmap/SectionCard";
import { SectionEditor } from "../components/roadmap/SectionEditor";
import {
  downloadBackup,
  parseBackup,
  roadmapProgress,
} from "../storage";
import type { Roadmap, RoadmapSection } from "../types";
import { makeId } from "../utils/ids";

type RoadmapDetailPageProps = {
  roadmaps: Roadmap[];
  setRoadmaps: (updater: (current: Roadmap[]) => Roadmap[]) => void;
};

export function RoadmapDetailPage({ roadmaps, setRoadmaps }: RoadmapDetailPageProps) {
  const { slug } = useParams();
  const roadmap = roadmaps.find((item) => item.slug === slug);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const progress = roadmap
    ? roadmapProgress(roadmap)
    : { done: 0, total: 0, percent: 0 };

  if (!roadmap) return <Navigate to="/roadmaps" replace />;
  const activeRoadmap = roadmap;

  function updateSections(sections: RoadmapSection[]) {
    setRoadmaps((current) => current.map((item) => (
      item.id === activeRoadmap.id ? { ...item, sections } : item
    )));
  }

  function updateSection(sectionId: string, value: RoadmapSection | null) {
    const sections = value
      ? activeRoadmap.sections.map((section) => section.id === sectionId ? value : section)
      : activeRoadmap.sections.filter((section) => section.id !== sectionId);
    updateSections(sections);
  }

  function addSection(title: string, notes: string) {
    const section: RoadmapSection = {
      id: makeId("section"),
      title,
      subtitle: "A section you added",
      notes,
      weeks: "Personal",
      color: "lime",
      todos: [],
      custom: true,
    };
    updateSections([...activeRoadmap.sections, section]);
    setIsAddingSection(false);
  }

  async function importFile(file?: File) {
    if (!file) return;

    try {
      const importedRoadmaps = await parseBackup(file);
      setRoadmaps(() => importedRoadmaps);
      setImportMessage("Backup restored successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not read that backup.";
      setImportMessage(message);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <main className="inner-page detail-page">
      <div className="breadcrumb">
        <Link to="/roadmaps">Roadmaps</Link>
        <span>/</span>
        <span>{roadmap.title}</span>
      </div>

      <section className="detail-hero">
        <div className="detail-copy">
          <TinyLabel>YOUR SIX-MONTH BUILD JOURNEY</TinyLabel>
          <h1>{roadmap.shortTitle}</h1>
          <p>{roadmap.description}</p>
          <div className="detail-chips">
            <span>{roadmap.duration}</span><i>·</i>
            <span>{roadmap.weeklyHours}</span><i>·</i>
            <span>26 weeks</span>
          </div>
        </div>
        <div className="detail-visual">
          <div className="visual-shape shape-one" />
          <div className="visual-shape shape-two" />
          <div className="visual-center"><span>C#</span><i>✳</i><b>AI</b></div>
          <div className="visual-caption">
            SENIOR<br />ENGINEER <span>→</span><br /><b>AI ARCHITECT</b>
          </div>
        </div>
      </section>

      <section className="progress-panel">
        <div className="progress-panel-head">
          <div>
            <span className="progress-kicker">YOUR JOURNEY</span>
            <h2>{progress.percent === 100 ? "You made it. What’s next?" : "Keep the momentum."}</h2>
            <p>{progress.done} of {progress.total} milestones complete</p>
          </div>
          <div
            className="progress-ring"
            style={{ "--progress": `${progress.percent * 3.6}deg` } as CSSProperties}
          >
            <span>{progress.percent}<small>%</small></span>
          </div>
        </div>
        <ProgressBar percent={progress.percent} />

        <div className="data-actions">
          <span>Saved in this browser <i>·</i> no account needed</span>
          <div>
            <button
              className="button button-quiet button-small"
              onClick={() => downloadBackup(roadmaps)}
              type="button"
            >
              <Icon name="download" /> Export backup
            </button>
            <button
              className="button button-quiet button-small"
              onClick={() => fileInput.current?.click()}
              type="button"
            >
              <Icon name="upload" /> Import backup
            </button>
            <input
              ref={fileInput}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importFile(event.target.files?.[0])}
            />
          </div>
        </div>
        {importMessage && <p className="form-message" role="status">{importMessage}</p>}
      </section>

      <section className="roadmap-sections">
        <div className="section-intro">
          <div>
            <TinyLabel>The route</TinyLabel>
            <h2>Six steps to your next chapter.</h2>
          </div>
          <span className="route-hours">260–312 focused hours</span>
        </div>
        <p className="section-explainer">
          Open each phase, work through the practical tasks, and use the milestone
          to check your understanding.
        </p>

        <div className="phases">
          {roadmap.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              onChange={(value) => updateSection(section.id, value)}
            />
          ))}
        </div>

        {isAddingSection ? (
          <SectionEditor onSave={addSection} onCancel={() => setIsAddingSection(false)} />
        ) : (
          <button
            className="add-section-button"
            type="button"
            onClick={() => setIsAddingSection(true)}
          >
            <span className="add-section-icon"><Icon name="plus" /></span>
            <span>
              <b>Add a section</b>
              <small>Add your own learning focus and todos</small>
            </span>
            <Icon name="arrow" />
          </button>
        )}
      </section>

      <section className="resource-section">
        <div className="section-intro">
          <div>
            <TinyLabel>Keep learning</TinyLabel>
            <h2>Official resources</h2>
          </div>
          <span className="resource-note">Checked for the roadmap</span>
        </div>
        <div className="resource-grid">
          {roadmap.links.map((resource) => (
            <a
              key={resource.label}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <span>
                <small>{resource.tag}</small>
                <b>{resource.label}</b>
              </span>
              <span className="external-mark">↗</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
