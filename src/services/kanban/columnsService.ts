import { kanbanApi } from './api';
import type { BoardColumn, CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from '@/types/kanban';
import type { AxiosResponse } from 'axios';

export const columnsService = {
  list: (boardId: string) => kanbanApi.get<BoardColumn[]>(`/boards/${boardId}/columns`).then((r: AxiosResponse<BoardColumn[]>) => r.data),
  get: (id: string) => kanbanApi.get<BoardColumn>(`/columns/${id}`).then((r: AxiosResponse<BoardColumn>) => r.data),
  create: (boardId: string, data: CreateColumnDto) => kanbanApi.post<BoardColumn>(`/boards/${boardId}/columns`, data).then((r: AxiosResponse<BoardColumn>) => r.data),
  update: (id: string, data: UpdateColumnDto) => kanbanApi.patch<BoardColumn>(`/columns/${id}`, data).then((r: AxiosResponse<BoardColumn>) => r.data),
  delete: (id: string) => kanbanApi.delete(`/columns/${id}`),
  reorder: (boardId: string, data: ReorderColumnsDto) => kanbanApi.patch(`/boards/${boardId}/columns/reorder`, data).then((r: AxiosResponse) => r.data),
};