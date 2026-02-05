
import { User, Team, Meeting, UserRole, TaskStatus, TaskPriority, ProjectStatus, ProjectRole, ActionItemStatus, AppState, LLMConfig, WeeklyReport, Note } from '../types';

const STORAGE_KEY = 'teamsync_data_v16'; // Increment version for config change

const DEFAULT_LLM_CONFIG: LLMConfig = {
    provider: 'local_http',
    baseUrl: 'http://127.0.0.1:8000/v1/chat/completions',
    model: 'gpt-3.5-turbo' // Placeholder common for local bridges
};

// --- INITIAL MINIMAL DATA (Production Start) ---
const INITIAL_ADMIN: User = { 
    id: 'u1', 
    uid: 'Admin', 
    firstName: 'Mathieu', 
    lastName: 'Admin', 
    functionTitle: 'Administrateur Système', 
    role: UserRole.ADMIN, 
    managerId: null, 
    password: '59565956'
};

// --- MOCK DATA FOR TESTING (Simulation) ---
const MOCK_USERS: User[] = [
  INITIAL_ADMIN,
  { id: 'u2', uid: 'MGR001', firstName: 'Alice', lastName: 'Dubois', functionTitle: 'Head of Engineering', role: UserRole.MANAGER, managerId: 'u1', password: '1234' },
  { id: 'u3', uid: 'MGR002', firstName: 'Bob', lastName: 'Martin', functionTitle: 'Head of Product', role: UserRole.MANAGER, managerId: 'u1', password: '1234' },
  { id: 'u4', uid: 'DEV001', firstName: 'Charlie', lastName: 'Durand', functionTitle: 'Senior Dev', role: UserRole.EMPLOYEE, managerId: 'u2', password: '1234' },
  { id: 'u5', uid: 'DEV002', firstName: 'David', lastName: 'Leroy', functionTitle: 'Frontend Dev', role: UserRole.EMPLOYEE, managerId: 'u2', password: '1234' },
  { id: 'u6', uid: 'PM001', firstName: 'Eve', lastName: 'Morel', functionTitle: 'Product Owner', role: UserRole.EMPLOYEE, managerId: 'u3', password: '1234' },
];

const MOCK_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Engineering Alpha',
    managerId: 'u2',
    projects: [
      {
        id: 'p1',
        name: 'Website Redesign',
        description: 'Migration vers React 18 et Tailwind',
        status: ProjectStatus.ACTIVE,
        managerId: 'u4',
        deadline: '2023-12-31',
        isImportant: true,
        docUrls: ['https://notion.so/specs-v2'],
        dependencies: [],
        members: [
            { userId: 'u4', role: ProjectRole.LEAD },
            { userId: 'u5', role: ProjectRole.CONTRIBUTOR }
        ],
        tasks: [
          { 
              id: 'tk1', title: 'Setup Repo', description: 'Initialisation git', status: TaskStatus.DONE, priority: TaskPriority.HIGH, assigneeId: 'u4', eta: '2023-10-01', weight: 1, isImportant: false, order: 1,
              checklist: [{ id: 'cl1', text: 'Create GitHub repo', done: true }] 
          },
          { 
              id: 'tk2', title: 'UI Components', description: 'Bibliothèque de composants', status: TaskStatus.ONGOING, priority: TaskPriority.MEDIUM, assigneeId: 'u5', eta: '2023-11-15', weight: 3, isImportant: false, order: 2,
              checklist: [{ id: 'cl3', text: 'Button Component', done: true }]
          }
        ]
      }
    ]
  }
];

export const getFullMockData = (): AppState => {
    return {
        users: MOCK_USERS,
        teams: MOCK_TEAMS,
        meetings: [],
        weeklyReports: [],
        notes: [],
        currentUser: null,
        theme: 'light',
        llmConfig: DEFAULT_LLM_CONFIG,
        prompts: {}
    };
};

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed.llmConfig) parsed.llmConfig = DEFAULT_LLM_CONFIG;
    if (!parsed.prompts) parsed.prompts = {};
    return parsed;
  }
  
  return {
    users: [INITIAL_ADMIN],
    teams: [],
    meetings: [],
    weeklyReports: [],
    notes: [],
    currentUser: null, 
    theme: 'light',
    llmConfig: DEFAULT_LLM_CONFIG,
    prompts: {}
  };
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearState = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
};
