import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id!);

  if (isLoading || !client) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <PageHeader title={client.name} backTo="/app/clients" />
      <div className="page-content space-y-4">
        {/* Avatar + Name */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary-50">
              {client.logoUrl ? (
                <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-xl">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-heading-03 text-gray-100">{client.name}</p>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card>
          <p className="text-label-01 text-gray-50 mb-3">Contact</p>
          <div className="space-y-3">
            {client.email && (
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-40 flex-shrink-0" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-body-01 text-primary truncate"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-40 flex-shrink-0" />
                <a
                  href={`tel:${client.phone}`}
                  className="text-body-01 text-primary"
                >
                  {client.phone}
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-40 flex-shrink-0 mt-0.5" />
                <p className="text-body-01 text-gray-70">{client.address}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/app/invoices/new')}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
          >
            Create Invoice
          </button>
        </div>
      </div>
    </>
  );
}
