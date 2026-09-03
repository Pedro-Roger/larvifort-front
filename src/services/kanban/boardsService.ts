import { kanbanApi } from './api';
import type { Board, CreateBoardDto, UpdateBoardDto } from '@/types/kanban';
import type { AxiosResponse } from 'axios';

export const boardsService = {
  list: (projectId: string) => kanbanApi.get<Board[]>(`/projects/${projectId}/boards`).then((r: AxiosResponse<Board[]>) => r.data),
  get: (id: string) => kanbanApi.get<Board>(`/boards/${id}`).then((r: AxiosResponse<Board>) => r.data),
  create: (projectId: string, data: CreateBoardDto) => kanbanApi.post<Board>(`/projects/${projectId}/boards`, data).then((r: AxiosResponse<Board>) => r.data),
  update: (id: string, data: UpdateBoardDto) => kanbanApi.patch<Board>(`/boards/${id}`, data).then((r: AxiosResponse<Board>) => r.data),
  delete: (id: string) => kanbanApi.delete(`/boards/${id}`),
};