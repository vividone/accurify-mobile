import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-20">
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="p-1 -ml-1 text-gray-70 active:bg-gray-10 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      )}
      <h1 className="flex-1 text-heading-02 text-gray-100 truncate">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
