import { useEffect, useRef, useState, type FormEvent } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useParams } from "react-router-dom";
import { downloadBackup, loadRoadmaps, parseBackup, roadmapProgress, saveRoadmaps } from "./storage";
import type { Roadmap, RoadmapSection, Todo } from "./types";
import "./App.css";

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zm7 11l1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14z",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM4 5.5v16M8 7h8M8 11h8",
    home: "m3 10 9-7 9 7M5 9v12h14V9m-9 12v-7h4v7",
    download: "M12 3v12m-5-5 5 5 5-5M5 20h14",
    upload: "M12 16V4m-5 5 5-5 5 5M5 20h14",
    plus: "M12 5v14M5 12h14",
    edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z",
    trash: "M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M18 6 6 18",
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] ?? paths.spark} /></svg>;
}

function Brand() {
  return <Link className="brand" to="/" aria-label="Roadmap Hub home"><span className="brand-mark"><Icon name="spark" /></span><span>Roadmap<span className="brand-light">Hub</span></span></Link>;
}

function Header() {
  return <header className="topbar"><Brand /><nav aria-label="Main navigation" className="main-nav">
    <NavLink to="/" end>Home</NavLink><NavLink to="/roadmaps">Roadmaps</NavLink>
  </nav><Link className="top-cta" to="/roadmaps/dotnet-to-ai-architect"><span>Pick up learning</span><Icon name="arrow" /></Link></header>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="page-frame"><Header />{children}<footer className="site-footer"><span>Made for steady progress, not streaks.</span><span className="footer-meta">ONE BUILD · SIX MONTHS · YOUR PACE</span></footer></div></div>;
}

function ProgressBar({ percent, label = "Roadmap progress" }: { percent: number; label?: string }) {
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="progress-fill" style={{ width: `${percent}%` }} /></div>;
}

function TinyLabel({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow"><span className="eyebrow-dot" />{children}</span>;
}

function Home({ roadmaps }: { roadmaps: Roadmap[] }) {
  const primary = roadmaps[0];
  const progress = primary ? roadmapProgress(primary) : { done: 0, total: 0, percent: 0 };
  const allProgress = roadmaps.map(roadmapProgress);
  const done = allProgress.reduce((sum, item) => sum + item.done, 0);
  const total = allProgress.reduce((sum, item) => sum + item.total, 0);
  return <main>
    <section className="hero home-hero">
      <div className="hero-copy"><TinyLabel>Build your next chapter</TinyLabel><h1>Small steps.<br /><span>Big systems.</span></h1><p>A home for ambitious roadmaps, practical milestones, and the work you’re building toward.</p><div className="hero-actions"><Link className="button button-lime" to="/roadmaps">Explore roadmaps <Icon name="arrow" /></Link><Link className="text-link" to="/roadmaps/dotnet-to-ai-architect">Continue your AI journey <span>↗</span></Link></div></div>
      <div className="hero-art" aria-label="Six connected learning milestones"><div className="orbit orbit-large"/><div className="orbit orbit-small"/><div className="orbit-core"><Icon name="spark" /></div><div className="orbit-node node-a">.NET</div><div className="orbit-node node-b">RAG</div><div className="orbit-node node-c">SHIP</div><div className="orbit-caption">BUILD<br /><b>WITH INTENT</b></div></div>
    </section>
    <section className="home-overview" aria-label="Learning snapshot"><div className="overview-note"><div className="overview-icon"><Icon name="book" /></div><div><strong>{roadmaps.length} roadmap{roadmaps.length === 1 ? "" : "s"}</strong><span>One focused place to grow</span></div></div><div className="overview-progress"><div className="overview-label"><span>Your progress</span><strong>{done}<small> / {total} milestones</small></strong></div><ProgressBar percent={total ? Math.round(done * 100 / total) : 0} label="Overall learning progress" /></div><div className="overview-pace"><span className="pace-spark">✳</span><div><strong>Go at your pace</strong><span>No streaks. Just forward.</span></div></div></section>
    <section className="featured-section"><div className="section-intro"><div><TinyLabel>Featured path</TinyLabel><h2>Your next big build</h2></div><Link className="text-link" to="/roadmaps">All roadmaps <span>↗</span></Link></div>
      {primary ? <Link className="feature-card" to={`/roadmaps/${primary.slug}`}><div className="feature-art"><span className="feature-glow"/><span className="feature-index">01 <i>— 06</i></span><div className="feature-rings"><span/><span/><span/><b>AI</b></div><span className="feature-stamp">C# <i>+</i> AI</span></div><div className="feature-content"><div className="card-meta"><span className="pill pill-lime">{primary.category}</span><span>{primary.duration}</span></div><h3>{primary.shortTitle}</h3><p>{primary.description}</p><div className="feature-bottom"><div className="feature-progress"><div className="progress-caption"><span>{progress.done} of {progress.total} milestones</span><strong>{progress.percent}%</strong></div><ProgressBar percent={progress.percent} /></div><span className="round-arrow"><Icon name="arrow" /></span></div></div></Link> : <div className="empty-state">Your first roadmap will show up here.</div>}
    </section>
    <section className="quote-strip"><span className="quote-mark">“</span><p>Architects don’t just learn tools.<br /><b>They learn where the tools belong.</b></p><span className="quote-tail">A principle for the journey <i>✳</i></span></section>
  </main>;
}

function RoadmapsPage({ roadmaps }: { roadmaps: Roadmap[] }) {
  return <main className="inner-page"><div className="page-heading"><TinyLabel>The library</TinyLabel><h1>Roadmaps for<br /><span>what’s next.</span></h1><p>Focused paths with real outcomes. More journeys can join the library as you grow.</p></div><div className="library-toolbar"><span>{roadmaps.length} roadmap{roadmaps.length === 1 ? "" : "s"} <i>·</i> curated for your next move</span><span className="library-decoration">EXPLORE <b>→</b></span></div><div className="roadmap-grid">{roadmaps.map((roadmap, index) => {
    const progress = roadmapProgress(roadmap);
    return <Link key={roadmap.id} className="library-card" to={`/roadmaps/${roadmap.slug}`}><div className={`library-art art-${index % 3}`}><div className="art-stamp">0{index + 1}</div><div className="art-mark">{roadmap.id === "dotnet-ai-architect" ? <><span>.NET</span><b>✳</b><span>AI</span></> : <span>{roadmap.category}</span>}</div><span className="art-arrow"><Icon name="arrow" /></span></div><div className="library-body"><div className="card-meta"><span className="pill pill-mint">{roadmap.category}</span><span>{roadmap.duration}</span></div><h2>{roadmap.shortTitle}</h2><p>{roadmap.description}</p><div className="library-foot"><span>{roadmap.sections.length} learning sections</span><strong>{progress.percent}% <span>complete</span></strong></div><ProgressBar percent={progress.percent} /></div></Link>;
  })}</div><div className="coming-note"><span className="coming-star">✳</span><div><strong>More paths, when you’re ready.</strong><p>This library is designed to grow with your goals.</p></div></div></main>;
}

function SectionEditor({ section, onSave, onCancel }: { section?: RoadmapSection; onSave: (title: string, notes: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(section?.title ?? "");
  const [notes, setNotes] = useState(section?.notes ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim()) onSave(title.trim(), notes.trim());
  }
  return <form className="section-editor" onSubmit={submit}><label>Section title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Retrieval quality" maxLength={100} required /></label><label>Notes <span>optional</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What do you want to achieve in this section?" rows={2} maxLength={500} /></label><div className="editor-actions"><button className="button button-lime" type="submit">{section ? "Save changes" : "Add section"}</button><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button></div></form>;
}

function TodoRow({ todo, onToggle, onChange, onDelete }: { todo: Todo; onToggle: () => void; onChange: (text: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  if (editing) return <form className="todo-edit" onSubmit={(event) => { event.preventDefault(); if (text.trim()) { onChange(text.trim()); setEditing(false); } }}><input aria-label="Edit todo" value={text} onChange={(event) => setText(event.target.value)} autoFocus maxLength={240} /><button className="icon-button" type="submit" aria-label="Save todo"><Icon name="check" /></button><button className="icon-button" type="button" onClick={() => { setText(todo.text); setEditing(false); }} aria-label="Cancel edit"><Icon name="close" /></button></form>;
  return <div className={`todo-row${todo.completed ? " is-done" : ""}`}><label className="todo-label"><input className="todo-check" type="checkbox" checked={todo.completed} onChange={onToggle} /><span className="checkmark"><Icon name="check" /></span><span>{todo.text}</span></label><div className="todo-actions"><button className="icon-button" onClick={() => setEditing(true)} type="button" aria-label={`Edit ${todo.text}`}><Icon name="edit" /></button><button className="icon-button danger-hover" onClick={onDelete} type="button" aria-label={`Delete ${todo.text}`}><Icon name="trash" /></button></div></div>;
}

function SectionCard({ section, index, onChange }: { section: RoadmapSection; index: number; onChange: (section: RoadmapSection | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [addingTodo, setAddingTodo] = useState(false);
  const [todoText, setTodoText] = useState("");
  const done = section.todos.filter((todo) => todo.completed).length;
  function patchTodo(todoId: string, update: Partial<Todo>) {
    onChange({ ...section, todos: section.todos.map((todo) => todo.id === todoId ? { ...todo, ...update } : todo) });
  }
  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!todoText.trim()) return;
    onChange({ ...section, todos: [...section.todos, { id: makeId("todo"), text: todoText.trim(), completed: false }] });
    setTodoText("");
    setAddingTodo(false);
  }
  return <article className={`phase-card tone-${section.color}${section.custom ? " custom-phase" : ""}`}>
    <div className="phase-spine"><span className="phase-number">{section.custom ? <Icon name="spark" /> : String(index + 1).padStart(2, "0")}</span><span className="phase-line" /></div>
    <div className="phase-main"><div className="phase-head"><div className="phase-title-wrap"><div className="phase-meta"><span>{section.weeks}</span><i>·</i><span>{section.custom ? "Your section" : `PHASE ${String(index + 1).padStart(2, "0")}`}</span></div><h3>{section.title}</h3><p className="phase-subtitle">{section.subtitle}</p></div><div className="phase-tools"><span className="phase-count">{done}<i> / {section.todos.length}</i></span><button className="icon-button" type="button" onClick={() => setEditing((value) => !value)} aria-label={`Edit section ${section.title}`}><Icon name="edit" /></button><button className="icon-button danger-hover" type="button" onClick={() => { if (window.confirm(`Delete “${section.title}” and its todos?`)) onChange(null); }} aria-label={`Delete section ${section.title}`}><Icon name="trash" /></button></div></div>
      {section.notes && <p className="phase-notes">{section.notes}</p>}
      {editing && <SectionEditor section={section} onSave={(title, notes) => { onChange({ ...section, title, notes }); setEditing(false); }} onCancel={() => setEditing(false)} />}
      <div className="todo-list">{section.todos.map((todo) => <TodoRow key={todo.id} todo={todo} onToggle={() => patchTodo(todo.id, { completed: !todo.completed })} onChange={(text) => patchTodo(todo.id, { text })} onDelete={() => onChange({ ...section, todos: section.todos.filter((item) => item.id !== todo.id) })} />)}</div>
      {addingTodo ? <form className="add-todo-form" onSubmit={addTodo}><input autoFocus value={todoText} onChange={(event) => setTodoText(event.target.value)} placeholder="Add a practical next step…" maxLength={240} aria-label="New todo" /><button className="button button-lime button-small" type="submit">Add task</button><button className="button button-quiet button-small" type="button" onClick={() => { setTodoText(""); setAddingTodo(false); }}>Cancel</button></form> : <button className="add-todo" type="button" onClick={() => setAddingTodo(true)}><Icon name="plus" /> Add a todo</button>}
      {section.milestone && <div className="milestone-note"><span className="milestone-star">✳</span><span><b>Milestone</b>{section.milestone}</span></div>}
    </div>
  </article>;
}

function RoadmapDetail({ roadmaps, setRoadmaps }: { roadmaps: Roadmap[]; setRoadmaps: (updater: (current: Roadmap[]) => Roadmap[]) => void }) {
  const { slug } = useParams();
  const roadmap = roadmaps.find((item) => item.slug === slug);
  const [addingSection, setAddingSection] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const progress = roadmap ? roadmapProgress(roadmap) : { done: 0, total: 0, percent: 0 };
  if (!roadmap) return <Navigate to="/roadmaps" replace />;
  const activeRoadmap = roadmap;
  function updateSections(next: RoadmapSection[]) {
    setRoadmaps((current) => current.map((item) => item.id === activeRoadmap.id ? { ...item, sections: next } : item));
  }
  function sectionChanged(id: string, value: RoadmapSection | null) {
    updateSections(value ? activeRoadmap.sections.map((section) => section.id === id ? value : section) : activeRoadmap.sections.filter((section) => section.id !== id));
  }
  function addSection(title: string, notes: string) {
    const section: RoadmapSection = { id: makeId("section"), title, subtitle: "A section you added", notes, weeks: "Personal", color: "lime", todos: [], custom: true };
    updateSections([...activeRoadmap.sections, section]);
    setAddingSection(false);
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      const imported = await parseBackup(file);
      setRoadmaps(() => imported);
      setImportMessage("Backup restored successfully.");
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Could not read that backup.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  return <main className="inner-page detail-page">
    <div className="breadcrumb"><Link to="/roadmaps">Roadmaps</Link><span>/</span><span>{roadmap.title}</span></div>
    <section className="detail-hero"><div className="detail-copy"><TinyLabel>YOUR SIX-MONTH BUILD JOURNEY</TinyLabel><h1>{activeRoadmap.shortTitle}</h1><p>{activeRoadmap.description}</p><div className="detail-chips"><span>{activeRoadmap.duration}</span><i>·</i><span>{activeRoadmap.weeklyHours}</span><i>·</i><span>26 weeks</span></div></div><div className="detail-visual"><div className="visual-shape shape-one"/><div className="visual-shape shape-two"/><div className="visual-center"><span>C#</span><i>✳</i><b>AI</b></div><div className="visual-caption">SENIOR<br />ENGINEER <span>→</span><br /><b>AI ARCHITECT</b></div></div></section>
    <section className="progress-panel"><div className="progress-panel-head"><div><span className="progress-kicker">YOUR JOURNEY</span><h2>{progress.percent === 100 ? "You made it. What’s next?" : "Keep the momentum."}</h2><p>{progress.done} of {progress.total} milestones complete</p></div><div className="progress-ring" style={{ "--progress": `${progress.percent * 3.6}deg` } as React.CSSProperties}><span>{progress.percent}<small>%</small></span></div></div><ProgressBar percent={progress.percent} /><div className="data-actions"><span>Saved in this browser <i>·</i> no account needed</span><div><button className="button button-quiet button-small" onClick={() => downloadBackup(roadmaps)} type="button"><Icon name="download" /> Export backup</button><button className="button button-quiet button-small" onClick={() => fileInput.current?.click()} type="button"><Icon name="upload" /> Import backup</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} /></div></div>{importMessage && <p className="form-message" role="status">{importMessage}</p>}</section>
    <section className="roadmap-sections"><div className="section-intro"><div><TinyLabel>The route</TinyLabel><h2>Six steps to your next chapter.</h2></div><span className="route-hours">260–312 focused hours</span></div><p className="section-explainer">Open each phase, work through the practical tasks, and use the milestone to check your understanding.</p>
      <div className="phases">{activeRoadmap.sections.map((section, index) => <SectionCard key={section.id} section={section} index={index} onChange={(value) => sectionChanged(section.id, value)} />)}</div>
      {addingSection ? <SectionEditor onSave={addSection} onCancel={() => setAddingSection(false)} /> : <button className="add-section-button" type="button" onClick={() => setAddingSection(true)}><span className="add-section-icon"><Icon name="plus" /></span><span><b>Add a section</b><small>Add your own learning focus and todos</small></span><Icon name="arrow" /></button>}
    </section>
    <section className="resource-section"><div className="section-intro"><div><TinyLabel>Keep learning</TinyLabel><h2>Official resources</h2></div><span className="resource-note">Checked for the roadmap</span></div><div className="resource-grid">{activeRoadmap.links.map((resource) => <a key={resource.label} href={resource.url} target="_blank" rel="noreferrer" className="resource-link"><span><small>{resource.tag}</small><b>{resource.label}</b></span><span className="external-mark">↗</span></a>)}</div></section>
  </main>;
}

function AppContent() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(loadRoadmaps);
  useEffect(() => saveRoadmaps(roadmaps), [roadmaps]);
  return <Shell><Routes><Route path="/" element={<Home roadmaps={roadmaps} />} /><Route path="/roadmaps" element={<RoadmapsPage roadmaps={roadmaps} />} /><Route path="/roadmaps/:slug" element={<RoadmapDetail roadmaps={roadmaps} setRoadmaps={setRoadmaps} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Shell>;
}

export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}
