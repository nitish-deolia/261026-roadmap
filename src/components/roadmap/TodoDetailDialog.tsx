import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import type { Todo, TodoStep } from "../../types";

type TodoDetailDialogProps = {
  todo: Todo;
  onClose: () => void;
  onToggleSubtask: (stepId: string, subtaskId: string, completed: boolean) => void;
};

export function TodoDetailDialog({ todo, onClose, onToggleSubtask }: TodoDetailDialogProps) {
  const details = todo.details;
  const [activeStepId, setActiveStepId] = useState(details?.steps[0]?.id ?? "");
  const activeStep = details?.steps.find((step) => step.id === activeStepId) ?? details?.steps[0];
  const allTasks = details?.steps.flatMap((step) => step.subtasks) ?? [];
  const completeCount = allTasks.filter((task) => task.completed).length;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  if (!details) return null;

  return (
    <div className="todo-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="todo-dialog" role="dialog" aria-modal="true" aria-labelledby="todo-dialog-title">
        <header className="todo-dialog-header">
          <div>
            <span className="dialog-eyebrow">LEARNING BREAKDOWN <i>·</i> {completeCount}/{allTasks.length} STEPS</span>
            <h2 id="todo-dialog-title">{todo.text}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close learning breakdown">
            <Icon name="close" />
          </button>
        </header>

        <div className="todo-dialog-body">
          <div className="learning-outcome">
            <div><span className="outcome-mark">✳</span></div>
            <div>
              <span className="dialog-eyebrow">WHY THIS MATTERS <i>·</i> {details.estimate}</span>
              <p>{details.objective}</p>
              <small><b>Make this tangible:</b> {details.deliverable}</small>
            </div>
          </div>

          <div className="learning-tree" aria-label="Interactive learning tree">
            <div className={`tree-root${todo.completed ? " tree-root-done" : ""}`}>
              <span className="tree-root-icon">{todo.completed ? "✓" : "✳"}</span>
              <div><small>THE GOAL</small><b>{todo.text}</b></div>
              <span className="tree-progress">{completeCount}/{allTasks.length}</span>
            </div>
            <div className="tree-branches">
              {details.steps.map((step) => (
                <TreeBranch
                  key={step.id}
                  step={step}
                  active={activeStep?.id === step.id}
                  onSelect={() => setActiveStepId(step.id)}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          </div>

          {activeStep && <StepFocus step={activeStep} resources={details.resources} />}
          <footer className="todo-dialog-footer">
            <span>{todo.completed ? "Every sub-item is complete. Nice work." : "The parent todo completes after every sub-item is checked."}</span>
            <button className="button button-lime button-small" type="button" onClick={onClose}>Back to roadmap</button>
          </footer>
        </div>
      </section>
    </div>
  );
}

type TreeBranchProps = {
  step: TodoStep;
  active: boolean;
  onSelect: () => void;
  onToggleSubtask: (stepId: string, subtaskId: string, completed: boolean) => void;
};

function TreeBranch({ step, active, onSelect, onToggleSubtask }: TreeBranchProps) {
  const done = step.subtasks.filter((task) => task.completed).length;
  return (
    <article className={`tree-branch${active ? " is-active" : ""}`}>
      <button className="tree-node" type="button" onClick={onSelect} aria-pressed={active}>
        <span className="tree-node-dot">{done === step.subtasks.length ? "✓" : "✳"}</span>
        <span><b>{step.title}</b><small>{done}/{step.subtasks.length} complete</small></span>
        <span className="tree-chevron">↘</span>
      </button>
      <div className="tree-leaves">
        {step.subtasks.map((task) => (
          <label key={task.id} className={`tree-leaf${task.completed ? " is-complete" : ""}`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(event) => onToggleSubtask(step.id, task.id, event.target.checked)}
            />
            <span className="leaf-check"><Icon name="check" /></span>
            <span>{task.text}</span>
          </label>
        ))}
      </div>
    </article>
  );
}

function StepFocus({ step, resources }: { step: TodoStep; resources: { label: string; url: string }[] }) {
  return (
    <section className="step-focus" aria-live="polite">
      <div>
        <span className="dialog-eyebrow">STEP FOCUS</span>
        <h3>{step.title}</h3>
        <p>{step.summary}</p>
      </div>
      {resources.length > 0 && (
        <div className="step-resources">
          <span className="dialog-eyebrow">OFFICIAL READING</span>
          {resources.map((resource) => (
            <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer">{resource.label} <span>↗</span></a>
          ))}
        </div>
      )}
    </section>
  );
}
