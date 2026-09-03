// Baseado em Evo CRM pipelines.ts + domínio LarviFort

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  boards?: Board[];
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  columns?: BoardColumn[];
  tasks?: Task[];
  project?: Project;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  color: string; // hex #RRGGBB
  position: number;
  semanticKey?: OrderStage; // opcional
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  board?: Board;
  tasks?: Task[];
}

export type OrderStage =
  | 'orcamento'
  | 'negociacao'
  | 'aprovado'
  | 'disponibilidade'
  | 'reservado'
  | 'producao'
  | 'pronto'
  | 'entregue';

export type OrderPriority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  organizationId: string;
  boardColumnId?: string;
  boardColumn?: BoardColumn;
  projectId?: string;
  project?: Project;
  parentTaskId?: string;
  parentTask?: Task;
  subtasks?: Task[];
  position: string; // LexoRank
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  priority: OrderPriority;
  tags: string[];
  clientId?: string;
  client?: Client;
  assigneeId?: string;
  assignee?: User;
  value?: number;
  servicesInfo?: ServicesInfo;
  tasksInfo?: TasksInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ServicesInfo {
  totalValue: number;
  currency: string;
  formattedTotal: string;
  hasServices: boolean;
}

export interface TasksInfo {
  pendingCount: number;
  overdueCount: number;
  dueSoonCount: number;
  completedCount: number;
  totalCount: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// DTOs para API
export interface CreateProjectDto {
  name: string;
  description?: string;
}
export type UpdateProjectDto = Partial<CreateProjectDto>;

export interface CreateBoardDto {
  name: string;
  description?: string;
}
export type UpdateBoardDto = Partial<CreateBoardDto>;

export interface CreateColumnDto {
  name: string;
  color: string;
  semanticKey?: OrderStage;
}
export type UpdateColumnDto = Partial<CreateColumnDto>;
export interface ReorderColumnsDto {
  columnIds: string[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  boardColumnId: string;
  priority?: OrderPriority;
  dueDate?: string;
  assigneeId?: string;
  clientId?: string;
  orderId?: string; // vincular Order existente
  tags?: string[];
  parentTaskId?: string;
}
export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  position?: string;
}
export interface MoveTaskDto {
  boardColumnId: string;
  position: string;
  fromColumnId: string;
}
export interface TaskFilters {
  search?: string;
  assigneeId?: string;
  status?: string; // conversation status
  priority?: OrderPriority;
  dateFrom?: string;
  dateTo?: string;
  period?: string;
  page?: number;
  perPage?: number;
}