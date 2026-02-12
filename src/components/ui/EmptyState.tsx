import clsx from 'clsx';

interface EmptyStateProps {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 bg-gray-10 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-40" />
        </div>
      )}
      <h3 className="text-heading-02 text-gray-100 mb-1">{title}</h3>
      {description && (
        <p className="text-body-01 text-gray-50 mb-4 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}
