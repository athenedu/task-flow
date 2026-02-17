import { useState } from 'react';
import {
  Plus, Search, Filter, ArrowUpDown, LayoutGrid, List,
  FolderOpen, CheckSquare, ChevronRight, X, Menu
} from 'lucide-react';
import { useTaskManager } from '@/hooks/useTaskManager';

import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { ProjectModal } from '@/components/ProjectModal';
import { TaskModal } from '@/components/TaskModal';
import { StatsPanel } from '@/components/StatsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task, Project, Status, Priority, SortOption } from '@/types';
import { cn } from '@/lib/utils';

export default function App() {
  const {
    projects,
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
  } = useTaskManager();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = (name: string, description: string, color: string) => {
    if (editingProject) {
      updateProject(editingProject.id, { name, description, color });
    } else {
      addProject(name, description, color);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto? Todas as tarefas serão removidas.')) {
      deleteProject(projectId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
  };

  const clearFilters = () => {
    setFilters({ status: 'todos', priority: 'todas', search: '' });
  };

  const hasActiveFilters = filters.status !== 'todos' || filters.priority !== 'todas' || filters.search;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3881ec] flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">TaskFlow</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddTask}
              className="bg-[#3881ec] hover:bg-[#1a5ec8] text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Nova Tarefa</span>
              <span className="sm:hidden">Tarefa</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
        )}>
          <div className="h-full overflow-y-auto pt-14 lg:pt-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#3881ec]" />
                  Projetos
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddProject}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    selectedProjectId === null
                      ? 'bg-[#f4f8fc] text-[#3881ec] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Todos os Projetos
                  <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {projects.length}
                  </span>
                </button>

                {projects.map((project) => (
                  <div key={project.id} className="group relative">
                    <button
                      onClick={() => setSelectedProjectId(project.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors pr-8',
                        selectedProjectId === project.id
                          ? 'bg-[#f4f8fc] text-[#3881ec] font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Ações</span>
                          <span className="w-4 h-4 flex items-center justify-center">
                            <span className="block w-1 h-1 bg-gray-400 rounded-full" />
                          </span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {/* Stats Panel */}
          <div className="mb-6">
            <StatsPanel stats={stats} />
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select
                    value={filters.status}
                    onValueChange={(v) => setFilters({ ...filters, status: v as Status | 'todos' })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos status</SelectItem>
                      <SelectItem value="na fila">Na fila</SelectItem>
                      <SelectItem value="em preparação">Em preparação</SelectItem>
                      <SelectItem value="iniciada">Iniciada</SelectItem>
                      <SelectItem value="em revisão">Em revisão</SelectItem>
                      <SelectItem value="concluída">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select
                  value={filters.priority}
                  onValueChange={(v) => setFilters({ ...filters, priority: v as Priority | 'todas' })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas prioridades</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="média">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="dueDate">Data de Previsão</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="createdAt">Data de Criação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                )}

                <div className="flex items-center border rounded-lg overflow-hidden ml-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Project Header */}
          {selectedProject && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              <span>Projetos</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-gray-900">{selectedProject.name}</span>
            </div>
          )}

          {/* Tasks Grid/List */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros para encontrar o que procura.'
                  : selectedProject
                    ? 'Comece adicionando uma nova tarefa a este projeto.'
                    : 'Selecione um projeto ou adicione uma nova tarefa.'}
              </p>
              <Button onClick={handleAddTask} className="bg-[#3881ec] hover:bg-[#1a5ec8]">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <TaskTable
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        project={editingProject}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
      />
    </div>
  );
}
