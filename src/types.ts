export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  details?: TodoDetails;
}

export interface TodoDetails {
  objective: string;
  estimate: string;
  deliverable: string;
  steps: TodoStep[];
  resources: { label: string; url: string }[];
}

export interface TodoStep {
  id: string;
  title: string;
  summary: string;
  subtasks: TodoSubtask[];
}

export interface TodoSubtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface RoadmapSection {
  id: string;
  title: string;
  subtitle: string;
  notes: string;
  weeks: string;
  color: "lime" | "mint" | "blue" | "violet" | "orange" | "pink";
  todos: Todo[];
  milestone?: string;
  custom?: boolean;
}

export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  duration: string;
  weeklyHours: string;
  sections: RoadmapSection[];
  links: { label: string; url: string; tag: string }[];
}

export interface RoadmapBackup {
  schemaVersion: 1;
  exportedAt: string;
  roadmaps: Roadmap[];
}
