import { kanbanApi } from './api';
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types/kanban';
import type { AxiosResponse } from 'axios';

export const projectsService = {
  list: () => kanbanApi.get<{ data: Project[] } | Project[]>('/projects').then((r: AxiosResponse<{ data: Project[] } | Project[]>) => {
    const d = r.data;
    return Array.isArray(d) ? d : d.data;
  }),
  get: (id: string) => kanbanApi.get<Project>(`/projects/${id}`).then((r: AxiosResponse<Project>) => r.data),
  create: (data: CreateProjectDto) => kanbanApi.post<Project>('/projects', data).then((r: AxiosResponse<Project>) => r.data),
  update: (id: string, data: UpdateProjectDto) => kanbanApi.patch<Project>(`/projects/${id}`, data).then((r: AxiosResponse<Project>) => r.data),
  delete: (id: string) => kanbanApi.delete(`/projects/${id}`),
};