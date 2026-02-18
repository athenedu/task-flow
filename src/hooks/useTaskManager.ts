import { useState, useCallback, useMemo } from 'react';
import type { Project, Task, Priority, Status, Filters, SortOption } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const priorityOrder: Record<Priority, number> = {
  'urgente': 0,
  'alta': 1,
  'média': 2,
  'baixa': 3
};

const statusOrder: Record<Status, number> = {
  'na fila': 0,
  'em preparação': 1,
  'iniciada': 2,
  'em revisão': 3,
  'concluída': 4
};

const projectColors = [
  '#3881ec', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export function useTaskManager() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Redesign completo do site corporativo',
      createdAt: new Date().toISOString(),
      color: '#3881ec'
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'Desenvolvimento do aplicativo mobile',
      createdAt: new Date().toISOString(),
      color: '#10b981'
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Definir paleta de cores',
      description: 'Escolher cores principais e secundárias para o novo design',
      priority: 'alta',
      dueDate: '2025-02-25',
      status: 'concluída',
      projectId: '1',
      createdAt: new Date().toISOString(),
      createdBy: '',
      assignedTo: null
    },
    {
      id: '2',
      title: 'Criar wireframes',
      description: 'Desenvolver wireframes das páginas principais',
      priority: 'urgente',
      dueDate: '2025-02-28',
      status: 'iniciada',
      projectId: '1',
      createdAt: new Date().toISOString(),
      createdBy: '',
      assignedTo: null
    },
    {
      id: '3',
      title: 'Configurar ambiente',
      description: 'Configurar ambiente de desenvolvimento mobile',
      priority: 'média',
      dueDate: '2025-03-05',
      status: 'na fila',
      projectId: '2',
      createdAt: new Date().toISOString(),
      createdBy: '',
      assignedTo: null
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(({
    status: 'todos',
    priority: 'todas',
    search: ''
  }));
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  // Project operations
  const addProject = useCallback((name: string, description: string, color?: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
      color: color || projectColors[Math.floor(Math.random() * projectColors.length)]
    };
    setProjects(prev => [...prev, newProject]);
    return newProject.id;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId]);

  // Task operations
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (selectedProjectId) {
      result = result.filter(t => t.projectId === selectedProjectId);
    }

    if (filters.status !== 'todos') {
      result = result.filter(t => t.status === filters.status);
    }

    if (filters.priority !== 'todas') {
      result = result.filter(t => t.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'status':
          return statusOrder[a.status] - statusOrder[b.status];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, selectedProjectId, filters, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const projectTasks = selectedProjectId
      ? tasks.filter(t => t.projectId === selectedProjectId)
      : tasks;

    return {
      total: projectTasks.length,
      byStatus: {
        'na fila': projectTasks.filter(t => t.status === 'na fila').length,
        'em preparação': projectTasks.filter(t => t.status === 'em preparação').length,
        'iniciada': projectTasks.filter(t => t.status === 'iniciada').length,
        'em revisão': projectTasks.filter(t => t.status === 'em revisão').length,
        'concluída': projectTasks.filter(t => t.status === 'concluída').length
      },
      byPriority: {
        'urgente': projectTasks.filter(t => t.priority === 'urgente').length,
        'alta': projectTasks.filter(t => t.priority === 'alta').length,
        'média': projectTasks.filter(t => t.priority === 'média').length,
        'baixa': projectTasks.filter(t => t.priority === 'baixa').length
      }
    };
  }, [tasks, selectedProjectId]);

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId) || null
    , [projects, selectedProjectId]);

  return {
    projects,
    tasks,
    selectedProjectId,
    selectedProject,
    filters,
    sortBy,
    filteredTasks,
    stats,
    setSelectedProjectId,
    setFilters,
    setSortBy,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask
  };
}
