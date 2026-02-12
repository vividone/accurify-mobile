import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '@/queries';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function ClientListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: clientsData, isLoading } = useClients(0, 100);
  const clients = clientsData?.content ?? [];

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['clients'] });
  }, [queryClient]);

  const { handlers, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader title="Clients" backTo="/app/dashboard" />
      <div className="page-content" {...handlers}>
        <PullIndicator />
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="No clients yet"
            description="Add your first client to start sending invoices."
          />
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <Card
                key={client.id}
                onClick={() => navigate(`/app/clients/${client.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary-50">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-semibold text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-01 font-medium text-gray-100 truncate">
                      {client.name}
                    </p>
                    <p className="text-label-01 text-gray-50 truncate">
                      {client.email}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
