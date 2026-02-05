
export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employé'
}

export enum TaskStatus {
  TODO = 'À faire',
  ONGOING = 'En cours',
  BLOCKED = 'Bloqué',
  DONE = 'Terminé'
}

export enum TaskPriority {
  LOW = 'Basse',
  MEDIUM = 'Moyenne',
  HIGH = 'Haute',
  URGENT = 'Urgente'
}

export enum ProjectStatus {
  PLANNING = 'Planification',
  ACTIVE = 'Actif',
  PAUSED = 'En pause',
  DONE = 'Terminé'
}

export enum ProjectRole {
  OWNER = 'Propriétaire',
  LEAD = 'Responsable',
  CONTRIBUTOR = 'Contributeur'
}

export enum ActionItemStatus {
  OPEN = 'Ouvert',
  IN_PROGRESS = 'En cours',
  COMPLETED = 'Terminé'
}

export type LLMProvider = 'local_http';

export interface LLMConfig {
  provider: LLMProvider;
  baseUrl?: string; 
  apiKey?: string; 
  model: string; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string, type: string, data?: string }[];
  timestamp: Date;
}

export interface User {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  functionTitle: string;
  role: UserRole;
  managerId?: string | null;
  avatarUrl?: string;
  password?: string; 
  location?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ExternalDependency {
  id: string;
  label: string; 
  status: 'Red' | 'Amber' | 'Green';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; 
  eta: string; 
  dependencies?: string[];
  externalDependencies?: ExternalDependency[];
  weight: number; 
  isImportant: boolean; 
  checklist?: ChecklistItem[]; 
  order?: number; 
}

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  managerId?: string; 
  deadline: string; 
  members: ProjectMember[];
  tasks: Task[];
  isImportant: boolean; 
  docUrls?: string[]; 
  dependencies?: string[];
  externalDependencies?: ExternalDependency[];
  additionalDescriptions?: string[];
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  projects: Project[];
}

export interface Meeting {
  id: string;
  teamId: string;
  projectId?: string; 
  date: string;
  title: string;
  attendees: string[];
  minutes: string;
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  description: string;
  ownerId: string;
  dueDate: string;
  status: ActionItemStatus;
}

export type HealthStatus = 'Green' | 'Amber' | 'Red'; 

export interface WeeklyReport {
  id: string;
  userId: string;
  weekOf: string; 
  mainSuccess: string;
  mainIssue: string;
  incident: string;
  orgaPoint: string;
  otherSection?: string; 
  teamHealth?: HealthStatus; 
  projectHealth?: HealthStatus; 
  updatedAt: string;
  managerCheck?: boolean; 
  managerAnnotation?: string; 
}

export type NoteBlockType = 'text' | 'image' | 'rectangle' | 'circle' | 'line' | 'drawing';

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  content?: string;
  position: { x: number, y: number };
  style?: {
    width?: string;
    height?: string;
    color?: string;
  };
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  blocks: NoteBlock[];
}

export interface AppState {
  users: User[];
  teams: Team[];
  meetings: Meeting[];
  weeklyReports: WeeklyReport[];
  notes: Note[]; 
  currentUser: User | null;
  theme: 'light' | 'dark';
  llmConfig: LLMConfig;
  prompts?: Record<string, string>;
}
