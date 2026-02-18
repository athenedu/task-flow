import type { Task, AppUser } from '@/types';
import { cn, formatDateShort, isDateOverdue } from '@/lib/utils';
import { Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { UserAvatar } from './UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  users: AppUser[];
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, users, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = isDateOverdue(task.dueDate) && task.status !== 'concluída';
  const assignedUser = users.find(u => u.id === task.assignedTo);
  const createdByUser = users.find(u => u.id === task.createdBy);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-[#3881ec]/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-[#3881ec] transition-colors">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Calendar className={cn(
                'w-3.5 h-3.5',
                isOverdue ? 'text-red-500' : 'text-gray-400'
              )} />
              <span className={cn(
                'text-xs',
                isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
              )}>
                {formatDateShort(task.dueDate)}
                {isOverdue && ' (atrasada)'}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {assignedUser && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Responsável:</span>
                  <UserAvatar
                    name={assignedUser.name}
                    email={assignedUser.email}
                    avatarUrl={assignedUser.avatar_url}
                    size="xs"
                    showName={false}
                    className="inline-flex"
                  />
                  <span className="text-xs text-gray-600 truncate max-w-[100px]">
                    {assignedUser.name || assignedUser.email}
                  </span>
                </div>
              )}

              {createdByUser && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Criado por:</span>
                  <UserAvatar
                    name={createdByUser.name}
                    email={createdByUser.email}
                    avatarUrl={createdByUser.avatar_url}
                    size="xs"
                    showName={false}
                    className="inline-flex"
                  />
                  <span className="text-xs text-gray-600 truncate max-w-[100px]">
                    {createdByUser.name || createdByUser.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
