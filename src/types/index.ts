export type Priority = 'urgente' | 'alta' | 'média' | 'baixa';
export type Status = 'na fila' | 'em preparação' | 'iniciada' | 'em revisão' | 'concluída';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  status: Status;
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  color: string;
}

export interface Filters {
  status: Status | 'todos';
  priority: Priority | 'todas';
  search: string;
}

export type SortOption = 'priority' | 'dueDate' | 'status' | 'createdAt' | 'title';
