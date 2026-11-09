import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientCreatePage } from './ClientCreatePage';

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'c-1' });
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/queries', () => ({ useCreateClient: () => ({ mutateAsync: mockMutateAsync, isPending: false }) }));
vi.mock('@/components/ui/PageHeader', () => ({ PageHeader: () => null }));
vi.mock('@/store/ui.store', () => ({
  useUIStore: (selector: (s: { showNotification: () => void }) => unknown) => selector({ showNotification: vi.fn() }),
}));

describe('ClientCreatePage', () => {
  it('saves the withholding settings, including a custom VAT rate', async () => {
    render(<ClientCreatePage />);

    fireEvent.change(screen.getByPlaceholderText('Client or company name'), { target: { value: 'Delta Oil Ltd' } });
    fireEvent.click(screen.getByRole('switch', { name: 'Withholds VAT at source' }));
    fireEvent.change(screen.getByLabelText('Amount of VAT withheld'), { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('VAT withheld, % of subtotal'), { target: { value: '3.75' } });
    fireEvent.click(screen.getByRole('switch', { name: "Doesn't deduct WHT, we remit it" }));
    fireEvent.click(screen.getByText('Create Client'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ withholdsVat: true, vatWithholdingRate: 0.0375, whtSelfRemitted: true })
      )
    );
  });
});
