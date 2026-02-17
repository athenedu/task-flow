import type { Project } from '@/types';
import { cn } from '@/lib/utils';
import { FolderOpen, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  taskCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, isSelected, taskCount, onClick, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        isSelected 
          ? 'border-[#3881ec] bg-[#f4f8fc] shadow-md' 
          : 'border-transparent bg-white hover:border-gray-200'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${project.color}15` }}
          >
            <FolderOpen className="w-5 h-5" style={{ color: project.color }} />
          </div>
          <div className="min-w-0">
            <h3 className={cn(
              'font-semibold text-sm truncate',
              isSelected ? 'text-[#3881ec]' : 'text-gray-900'
            )}>
              {project.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{taskCount} tarefas</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {project.description && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{project.description}</p>
      )}
    </div>
  );
}
