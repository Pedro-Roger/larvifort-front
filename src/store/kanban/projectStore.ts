import { create } from 'zustand';
import type { Project, Board, User } from '@/types/kanban';

interface ProjectState {
  projects: Project[];
  agents: User[];
  currentProjectId: string | null;
  currentBoardId: string | null;
  setProjects: (p: Project[]) => void;
  setAgents: (agents: User[]) => void;
  setCurrentProject: (id: string) => void;
  setCurrentBoard: (id: string) => void;
  getCurrentBoard: () => Board | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  agents: [],
  currentProjectId: null,
  currentBoardId: null,
  setProjects: (projects) => set({ projects }),
  setAgents: (agents) => set({ agents }),
  setCurrentProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    const board = project?.boards?.find((b) => b.isDefault) || project?.boards?.[0];
    set({ currentProjectId: projectId, currentBoardId: board?.id || null });
  },
  setCurrentBoard: (boardId) => set({ currentBoardId: boardId }),
  getCurrentBoard: () => {
    const { projects, currentProjectId, currentBoardId } = get();
    return projects.find((p) => p.id === currentProjectId)?.boards?.find((b) => b.id === currentBoardId);
  },
}));