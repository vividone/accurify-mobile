import clsx from 'clsx';

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  danger: 'bg-danger-light text-danger-dark',
  info: 'bg-info-light text-info',
  gray: 'bg-gray-20 text-gray-60',
  purple: 'bg-purple-50 text-purple-700',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
