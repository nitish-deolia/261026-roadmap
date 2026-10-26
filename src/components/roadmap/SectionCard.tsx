import { useState, type FormEvent } from "react";
import { Icon } from "../Icon";
import { SectionEditor } from "./SectionEditor";
import { TodoRow } from "./TodoRow";
import { TodoDetailDialog } from "./TodoDetailDialog";
import { createTodoDetails } from "../../data/todoGuides";
import { makeId } from "../../utils/ids";
import type { RoadmapSection, Todo } from "../../types";

type SectionCardProps = {
  section: RoadmapSection;
  index: number;
  onChange: (section: RoadmapSection | null) => void;
};

export function SectionCard({ section, index, onChange }: SectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [todoText, setTodoText] = useState("");
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);
  const openTodo = section.todos.find((todo) => todo.id === openTodoId);
  const completedCount = section.todos.filter((todo) => todo.completed).length;
  const phaseNumber = String(index + 1).padStart(2, "0");

  function updateTodo(todoId: string, update: Partial<Todo>) {
    const todos = section.todos.map((todo) => (
      todo.id === todoId ? { ...todo, ...update } : todo
    ));
    onChange({ ...section, todos });
  }

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = todoText.trim();
    if (!trimmedText) return;

    const todo: Todo = {
      id: makeId("todo"),
      text: trimmedText,
      completed: false,
      details: undefined,
    };
    onChange({ ...section, todos: [...section.todos, todo] });
    setTodoText("");
    setIsAddingTodo(false);
  }

  function deleteSection() {
    const shouldDelete = window.confirm(`Delete “${section.title}” and its todos?`);
    if (shouldDelete) onChange(null);
  }

  function deleteTodo(todoId: string) {
    const todos = section.todos.filter((todo) => todo.id !== todoId);
    onChange({ ...section, todos });
  }

  function cancelAddTodo() {
    setTodoText("");
    setIsAddingTodo(false);
  }

  return (
    <article className={`phase-card tone-${section.color}${section.custom ? " custom-phase" : ""}`}>
      <div className="phase-spine">
        <span className="phase-number">
          {section.custom ? <Icon name="spark" /> : phaseNumber}
        </span>
        <span className="phase-line" />
      </div>

      <div className="phase-main">
        <div className="phase-head">
          <div className="phase-title-wrap">
            <div className="phase-meta">
              <span>{section.weeks}</span>
              <i>·</i>
              <span>{section.custom ? "Your section" : `PHASE ${phaseNumber}`}</span>
            </div>
            <h3>{section.title}</h3>
            <p className="phase-subtitle">{section.subtitle}</p>
          </div>
          <div className="phase-tools">
            <span className="phase-count">{completedCount}<i> / {section.todos.length}</i></span>
            <button
              className="icon-button"
              type="button"
              onClick={() => setIsEditing((editing) => !editing)}
              aria-label={`Edit section ${section.title}`}
            >
              <Icon name="edit" />
            </button>
            <button
              className="icon-button danger-hover"
              type="button"
              onClick={deleteSection}
              aria-label={`Delete section ${section.title}`}
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>

        {section.notes && <p className="phase-notes">{section.notes}</p>}

        {isEditing && (
          <SectionEditor
            section={section}
            onSave={(title, notes) => {
              onChange({ ...section, title, notes });
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}

        <div className="todo-list">
          {section.todos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onOpen={() => {
                if (!todo.details) updateTodo(todo.id, { details: createTodoDetails(todo) });
                setOpenTodoId(todo.id);
              }}
              onChange={(text) => updateTodo(todo.id, { text })}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))}
        </div>

        {openTodo && (
          <TodoDetailDialog
            todo={openTodo.details ? openTodo : { ...openTodo, details: createTodoDetails(openTodo) }}
            onClose={() => setOpenTodoId(null)}
            onToggleSubtask={(stepId, subtaskId, completed) => {
              if (!openTodo.details) return;
              const steps = openTodo.details.steps.map((step) => step.id !== stepId ? step : {
                ...step,
                subtasks: step.subtasks.map((task) => task.id === subtaskId ? { ...task, completed } : task),
              });
              const parentCompleted = steps.every((step) => step.subtasks.every((task) => task.completed));
              updateTodo(openTodo.id, {
                details: { ...openTodo.details, steps },
                completed: parentCompleted,
              });
            }}
          />
        )}

        {isAddingTodo ? (
          <form className="add-todo-form" onSubmit={addTodo}>
            <input
              autoFocus
              value={todoText}
              onChange={(event) => setTodoText(event.target.value)}
              placeholder="Add a practical next step…"
              maxLength={240}
              aria-label="New todo"
            />
            <button className="button button-lime button-small" type="submit">Add task</button>
            <button className="button button-quiet button-small" type="button" onClick={cancelAddTodo}>
              Cancel
            </button>
          </form>
        ) : (
          <button className="add-todo" type="button" onClick={() => setIsAddingTodo(true)}>
            <Icon name="plus" /> Add a todo
          </button>
        )}

        {section.milestone && (
          <div className="milestone-note">
            <span className="milestone-star">✳</span>
            <span><b>Milestone</b>{section.milestone}</span>
          </div>
        )}
      </div>
    </article>
  );
}
