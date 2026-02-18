import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Task, Priority, Status, Filters, SortOption, AppUser } from '@/types';

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
  const [users, setUsers] = useState<AppUser[]>([]);
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

  // Carregar usuários
  const loadUsers = useCallback(async () => {
    if (!user) return;

    try {
      // Tentar usar uma função RPC customizada se existir
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_users') as { data: any[] | null, error: any };

      if (rpcData && !rpcError) {
        setUsers(rpcData.map((u: any) => ({
          id: u.id,
          email: u.email || '',
          name: u.name || u.email?.split('@')[0],
          avatar_url: u.avatar_url
        })));
        return;
      }
    } catch (err) {
      // RPC não existe, usar método alternativo
    }

    // Fallback: buscar usuários únicos das tarefas existentes + usuário atual
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('created_by, assigned_to');

    const uniqueUserIds = new Set<string>();
    uniqueUserIds.add(user.id);

    if (tasksData) {
      tasksData.forEach((task: any) => {
        if (task.created_by) uniqueUserIds.add(task.created_by);
        if (task.assigned_to) uniqueUserIds.add(task.assigned_to);
      });
    }

    // Buscar perfis dos usuários
    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url')
      .in('id', Array.from(uniqueUserIds));

    const profilesMap = new Map(
      (profilesData || []).map((p: any) => [p.id, p])
    );

    // Buscar informações dos usuários
    const usersList: AppUser[] = [];

    for (const userId of uniqueUserIds) {
      const profile = profilesMap.get(userId);

      if (userId === user.id) {
        usersList.push({
          id: user.id,
          email: user.email || '',
          name: profile?.display_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: profile?.avatar_url
        });
      } else {
        // Para outros usuários, buscar do perfil ou usar fallback
        usersList.push({
          id: userId,
          email: `user_${userId.substring(0, 8)}@taskflow.app`,
          name: profile?.display_name || `Usuário ${userId.substring(0, 8)}`,
          avatar_url: profile?.avatar_url
        });
      }
    }

    setUsers(usersList);
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
        createdAt: t.created_at,
        createdBy: t.created_by,
        assignedTo: t.assigned_to
      })));
    }
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([loadProjects(), loadTasks(), loadUsers()]).finally(() => setLoading(false));
    }
  }, [user, loadProjects, loadTasks, loadUsers]);

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

      setProjects((prev: Project[]) => [newProject, ...prev]);
      return projectData.id;
    }
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    const updateData: Record<string, any> = {
      name: updates.name,
      description: updates.description,
      color: updates.color
    };

    const { error: updateError } = await (supabase
      .from('projects') as any)
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar projeto:', updateError);
      return;
    }

    setProjects((prev: Project[]) => prev.map((p: Project) =>
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

    setProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== id));
    setTasks((prev: Task[]) => prev.filter((t: Task) => t.projectId !== id));

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
        project_id: task.projectId,
        created_by: task.createdBy,
        assigned_to: task.assignedTo
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
        createdAt: taskData.created_at,
        createdBy: taskData.created_by,
        assignedTo: taskData.assigned_to
      };

      setTasks((prev: Task[]) => [newTask, ...prev]);
      return taskData.id;
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    const updateData: Record<string, any> = {
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      due_date: updates.dueDate,
      status: updates.status,
      project_id: updates.projectId,
      assigned_to: updates.assignedTo
    };

    const { error: updateError } = await (supabase
      .from('tasks') as any)
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar tarefa:', updateError);
      return;
    }

    setTasks((prev: Task[]) => prev.map((t: Task) =>
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

    setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== id));
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
    users,
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
