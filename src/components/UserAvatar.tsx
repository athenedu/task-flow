import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGravatarUrl } from '@/lib/gravatar';

interface UserAvatarProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base'
};

const iconSizes = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

const gravatarSizes = {
  xs: 40,
  sm: 48,
  md: 64,
  lg: 80
};

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 'sm',
  showName = true,
  className
}: UserAvatarProps) {
  const displayName = name || email?.split('@')[0] || 'Usuário';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ];

  // Gerar cor baseada no nome (consistente)
  const colorIndex = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  // Determinar qual imagem usar: custom URL -> Gravatar -> iniciais
  const gravatarUrl = email ? getGravatarUrl(email, gravatarSizes[size]) : null;
  const imageUrl = avatarUrl || gravatarUrl;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
          onError={(e) => {
            // Se a imagem falhar ao carregar, esconder e mostrar iniciais
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-medium',
          sizeClasses[size],
          bgColor,
          imageUrl ? 'hidden' : ''
        )}
      >
        {initials || <User className={iconSizes[size]} />}
      </div>
      {showName && (
        <span className="text-sm text-gray-700 truncate max-w-[150px]">
          {displayName}
        </span>
      )}
    </div>
  );
}
