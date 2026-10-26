import { useState, type FormEvent } from "react";
import type { RoadmapSection } from "../../types";

type SectionEditorProps = {
  section?: RoadmapSection;
  onSave: (title: string, notes: string) => void;
  onCancel: () => void;
};

export function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  const [title, setTitle] = useState(section?.title ?? "");
  const [notes, setNotes] = useState(section?.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle) onSave(trimmedTitle, notes.trim());
  }

  return (
    <form className="section-editor" onSubmit={handleSubmit}>
      <label>
        Section title
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Retrieval quality"
          maxLength={100}
          required
        />
      </label>
      <label>
        Notes <span>optional</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What do you want to achieve in this section?"
          rows={2}
          maxLength={500}
        />
      </label>
      <div className="editor-actions">
        <button className="button button-lime" type="submit">
          {section ? "Save changes" : "Add section"}
        </button>
        <button className="button button-quiet" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
