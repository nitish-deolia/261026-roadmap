export interface Todo {
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
