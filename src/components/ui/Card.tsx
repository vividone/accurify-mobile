import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  padding = true,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg shadow-card',
        padding && 'p-4',
        onClick && 'w-full text-left active:shadow-card-hover transition-shadow',
        className
      )}
    >
      {children}
    </Component>
  );
}
