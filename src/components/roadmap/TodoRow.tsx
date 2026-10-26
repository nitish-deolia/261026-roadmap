import { useState, type FormEvent } from "react";
import { Icon } from "../Icon";
import type { Todo } from "../../types";

type TodoRowProps = {
  todo: Todo;
  onToggle: () => void;
  onChange: (text: string) => void;
  onDelete: () => void;
};

export function TodoRow({ todo, onToggle, onChange, onDelete }: TodoRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  function saveTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    onChange(trimmedText);
    setIsEditing(false);
  }

  function cancelEdit() {
    setText(todo.text);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form className="todo-edit" onSubmit={saveTodo}>
        <input
          aria-label="Edit todo"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoFocus
          maxLength={240}
        />
        <button className="icon-button" type="submit" aria-label="Save todo">
          <Icon name="check" />
        </button>
        <button className="icon-button" type="button" onClick={cancelEdit} aria-label="Cancel edit">
          <Icon name="close" />
        </button>
      </form>
    );
  }

  return (
    <div className={`todo-row${todo.completed ? " is-done" : ""}`}>
      <label className="todo-label">
        <input className="todo-check" type="checkbox" checked={todo.completed} onChange={onToggle} />
        <span className="checkmark"><Icon name="check" /></span>
        <span>{todo.text}</span>
      </label>
      <div className="todo-actions">
        <button
          className="icon-button"
          onClick={() => setIsEditing(true)}
          type="button"
          aria-label={`Edit ${todo.text}`}
        >
          <Icon name="edit" />
        </button>
        <button
          className="icon-button danger-hover"
          onClick={onDelete}
          type="button"
          aria-label={`Delete ${todo.text}`}
        >
          <Icon name="trash" />
        </button>
      </div>
    </div>
  );
}
