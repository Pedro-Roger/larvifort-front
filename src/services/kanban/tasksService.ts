import { kanbanApi } from './api';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskFilters,
} from '@/types/kanban';
import type { AxiosResponse } from 'axios';

/* eslint-disable @typescript-eslint/no-explicit-any */
type RawTask = Record<string, any>;

function mapTask(raw: RawTask): Task {
  return {
    ...raw,
    title: raw.product ?? raw.title ?? '',
    description: raw.notes ?? raw.description,
    assigneeId: raw.ownerUserId ?? raw.assigneeId,
    position: raw.position ?? '0000',
    tags: raw.tags ?? [],
    status: raw.status ?? 'pending',
    subtasks: raw.subtasks?.map(mapTask),
  };
}

function mapCreateDto(dto: CreateTaskDto) {
  const { title, description, assigneeId, ...rest } = dto;
  return {
    ...rest,
    product: title,
    notes: description,
    ownerUserId: assigneeId,
  };
}

function mapUpdateDto(dto: UpdateTaskDto) {
  const mapped: Record<string, any> = {};
  if (dto.title !== undefined) mapped.product = dto.title;
  if (dto.description !== undefined) mapped.notes = dto.description;
  if (dto.assigneeId !== undefined) mapped.ownerUserId = dto.assigneeId;
  if (dto.priority !== undefined) mapped.priority = dto.priority;
  if (dto.dueDate !== undefined) mapped.dueDate = dto.dueDate;
  if (dto.boardColumnId !== undefined) mapped.boardColumnId = dto.boardColumnId;
  if (dto.tags !== undefined) mapped.tags = dto.tags;
  if (dto.clientId !== undefined) mapped.clientId = dto.clientId;
  if (dto.parentTaskId !== undefined) mapped.parentTaskId = dto.parentTaskId;
  return mapped;
}

export const tasksService = {
  listByBoard: (boardId: string, filters?: TaskFilters) =>
    kanbanApi.get(`/boards/${boardId}/tasks`, { params: filters }).then((r: AxiosResponse) => {
      const d = r.data;
      const items = Array.isArray(d) ? d : d.data ?? [];
      return items.map(mapTask);
    }),

  get: (boardId: string, id: string) =>
    kanbanApi.get(`/boards/${boardId}/tasks/${id}`).then((r: AxiosResponse) => mapTask(r.data)),

  create: (boardId: string, data: CreateTaskDto) =>
    kanbanApi.post(`/boards/${boardId}/tasks`, mapCreateDto(data)).then((r: AxiosResponse) => mapTask(r.data)),

  update: (boardId: string, id: string, data: UpdateTaskDto) =>
    kanbanApi.patch(`/boards/${boardId}/tasks/${id}`, mapUpdateDto(data)).then((r: AxiosResponse) => mapTask(r.data)),

  delete: (boardId: string, id: string) =>
    kanbanApi.delete(`/boards/${boardId}/tasks/${id}`),

  move: (boardId: string, taskId: string, data: MoveTaskDto) =>
    kanbanApi.patch(`/boards/${boardId}/tasks/${taskId}/move`, data).then((r: AxiosResponse) => r.data),

  createSubtask: (boardId: string, taskId: string, data: CreateTaskDto) =>
    kanbanApi.post(`/boards/${boardId}/tasks/${taskId}/subtasks`, mapCreateDto(data)).then((r: AxiosResponse) => mapTask(r.data)),

  complete: (boardId: string, taskId: string) =>
    kanbanApi.patch(`/boards/${boardId}/tasks/${taskId}/complete`).then((r: AxiosResponse) => mapTask(r.data)),

  reopen: (boardId: string, taskId: string) =>
    kanbanApi.patch(`/boards/${boardId}/tasks/${taskId}/reopen`).then((r: AxiosResponse) => mapTask(r.data)),
};
