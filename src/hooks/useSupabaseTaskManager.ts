import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Task, Priority, Status, Filters, SortOption } from '@/types';

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

export function useSupabaseTaskManager() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: 'todos',
    priority: 'todas',
    search: ''
  });
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  // Carregar projetos
  const loadProjects = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar projetos:', error);
      return;
    }

    if (data) {
      setProjects((data as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        color: p.color,
        createdAt: p.created_at
      })));
    }
  }, [user]);

  // Carregar tarefas
  const loadTasks = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar tarefas:', error);
      return;
    }

    if (data) {
      setTasks((data as any[]).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        priority: t.priority,
        dueDate: t.due_date,
        status: t.status,
        projectId: t.project_id,
        createdAt: t.created_at
      })));
    }
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([loadProjects(), loadTasks()]).finally(() => setLoading(false));
    }
  }, [user, loadProjects, loadTasks]);

  // Project operations
  const addProject = useCallback(async (name: string, description: string, color: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        color
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar projeto:', error);
      return;
    }

    if (data) {
      const projectData = data as any;
      const newProject: Project = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color,
        createdAt: projectData.created_at
      };

      setProjects(prev => [newProject, ...prev]);
      return projectData.id;
    }
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color
      } as any)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar projeto:', updateError);
      return;
    }

    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) return;

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir projeto:', deleteError);
      return;
    }

    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));

    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  }, [user, selectedProjectId]);

  // Task operations
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate,
        status: task.status,
        project_id: task.projectId
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar tarefa:', error);
      return;
    }

    if (data) {
      const taskData = data as any;
      const newTask: Task = {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority,
        dueDate: taskData.due_date,
        status: taskData.status,
        projectId: taskData.project_id,
        createdAt: taskData.created_at
      };

      setTasks(prev => [newTask, ...prev]);
      return taskData.id;
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        due_date: updates.dueDate,
        status: updates.status,
        project_id: updates.projectId
      } as any)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar tarefa:', updateError);
      return;
    }

    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Erro ao excluir tarefa:', deleteError);
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
  }, [user]);

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
    loading,
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
