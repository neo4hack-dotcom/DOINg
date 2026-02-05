
import { User, Team, UserRole, ProjectStatus, AppState, LLMConfig } from '../types';

const STORAGE_KEY = 'doing_local_v1';

const DEFAULT_LLM_CONFIG: LLMConfig = {
    provider: 'local_http',
    baseUrl: 'http://127.0.0.1:11434/v1/chat/completions', // Par défaut Ollama
    model: 'llama3'
};

const INITIAL_ADMIN: User = { 
    id: 'u1', 
    uid: 'ADMIN', 
    firstName: 'Directeur', 
    lastName: 'Général', 
    functionTitle: 'Direction', 
    role: UserRole.ADMIN, 
    managerId: null, 
    password: 'admin'
};

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed.llmConfig) parsed.llmConfig = DEFAULT_LLM_CONFIG;
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

export const getFullMockData = (): AppState => {
    return {
        users: [
            INITIAL_ADMIN,
            { id: 'u2', uid: 'MGR01', firstName: 'Sophie', lastName: 'Martin', functionTitle: 'Responsable Opérations', role: UserRole.MANAGER, managerId: 'u1', password: '123' },
            { id: 'u3', uid: 'DEV01', firstName: 'Jean', lastName: 'Dupont', functionTitle: 'Analyste Senior', role: UserRole.EMPLOYEE, managerId: 'u2', password: '123' }
        ],
        teams: [
            {
                id: 't1',
                name: 'Équipe Projet Alpha',
                managerId: 'u2',
                projects: [
                    {
                        id: 'p1',
                        name: 'Refonte Reporting',
                        description: 'Déploiement de la nouvelle structure de rapports locaux.',
                        status: ProjectStatus.ACTIVE,
                        managerId: 'u2',
                        deadline: '2025-06-30',
                        isImportant: true,
                        members: [{ userId: 'u3', role: UserRole.EMPLOYEE as any }],
                        tasks: [],
                        docUrls: [],
                        dependencies: [],
                        externalDependencies: [],
                        additionalDescriptions: []
                    }
                ]
            }
        ],
        meetings: [],
        weeklyReports: [],
        notes: [],
        currentUser: null,
        theme: 'light',
        llmConfig: DEFAULT_LLM_CONFIG,
        prompts: {}
    };
};
