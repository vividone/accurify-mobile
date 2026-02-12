import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/services/api/business.api';
import { useBusinessStore } from '@/store/business.store';
import type { Business, BusinessRequest } from '@/types';

const BUSINESS_QUERY_KEY = ['business'];

/**
 * Get current user's business
 */
export const useMyBusiness = () => {
  const { setBusiness, setLoading } = useBusinessStore();

  return useQuery({
    queryKey: BUSINESS_QUERY_KEY,
    queryFn: async () => {
      setLoading(true);
      try {
        const business = await businessApi.get();
        setBusiness(business);
        return business;
      } finally {
        setLoading(false);
      }
    },
  });
};

/**
 * Update business
 */
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  const { setBusiness } = useBusinessStore();

  return useMutation({
    mutationFn: (data: BusinessRequest) => businessApi.update(data),
    onSuccess: (business: Business) => {
      queryClient.setQueryData(BUSINESS_QUERY_KEY, business);
      setBusiness(business);
    },
  });
};

/**
 * Upload business logo
 */
export const useUploadBusinessLogo = () => {
  const queryClient = useQueryClient();
  const { business, setBusiness } = useBusinessStore();

  return useMutation({
    mutationFn: (file: File) => businessApi.uploadLogo(file),
    onSuccess: (logoUrl: string) => {
      // Update business with new logo URL
      if (business) {
        const updatedBusiness = { ...business, logoUrl };
        queryClient.setQueryData(BUSINESS_QUERY_KEY, updatedBusiness);
        setBusiness(updatedBusiness);
      }
      // Invalidate to refetch from server
      queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY });
    },
  });
};
