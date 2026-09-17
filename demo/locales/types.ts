export type DemoSectionId =
  | 'welcome'
  | 'projects'
  | 'capacity'
  | 'activity'
  | 'tasks'
  | 'project-board'
  | 'knowledge'
  | 'settings';
export interface DemoCopy {
  sections: Record<DemoSectionId, { title: string; description: string }>;
  plan: string;
  capacity: string;
  privacy: string;
  followup: string;
  planTitle: string;
}
