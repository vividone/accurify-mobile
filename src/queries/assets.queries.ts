import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/services/api';

export const assetKeys = {
  all: ['fixed-assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...assetKeys.lists(), { page, size }] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
};

export function useFixedAssets(page = 0, size = 20) {
  return useQuery({
    queryKey: assetKeys.list(page, size),
    queryFn: () => assetsApi.list(page, size),
  });
}

export function useFixedAsset(id: string) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetsApi.getById(id),
    enabled: !!id,
  });
}
