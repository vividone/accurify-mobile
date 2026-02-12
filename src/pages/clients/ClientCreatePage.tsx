import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateClient } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { useUIStore } from '@/store/ui.store';

export function ClientCreatePage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);
  const createClient = useCreateClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      const client = await createClient.mutateAsync({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      showNotification('Success', 'Client created', 'success');
      navigate(`/app/clients/${client.id}`, { replace: true });
    } catch {
      showNotification('Error', 'Failed to create client', 'error');
    }
  };

  return (
    <>
      <PageHeader title="New Client" backTo="/app/clients" />
      <div className="page-content space-y-4">
        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Name *</label>
          <input
            type="text"
            placeholder="Client or company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>

        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>

        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Phone</label>
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>

        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Address</label>
          <textarea
            rows={2}
            placeholder="Client address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || createClient.isPending}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
          >
            {createClient.isPending ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </div>
    </>
  );
}
