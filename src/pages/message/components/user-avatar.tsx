import { cn } from '@/lib/utils';
import { initialsOf } from './message-utils';

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-16 w-16 text-lg'
};

const DOT_SIZES = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
};

interface UserAvatarProps {
  name: string;
  image?: string;
  size?: keyof typeof SIZES;
  /** Omit to hide the presence dot entirely. */
  online?: boolean;
  className?: string;
}

export function UserAvatar({
  name,
  image,
  size = 'md',
  online,
  className
}: UserAvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={cn('rounded-full object-cover', SIZES[size])}
        />
      ) : (
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-watney/10 font-bold text-watney',
            SIZES[size]
          )}
        >
          {initialsOf(name)}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            DOT_SIZES[size],
            online ? 'bg-emerald-500' : 'bg-gray-300'
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </span>
  );
}
