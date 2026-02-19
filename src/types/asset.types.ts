export type FixedAssetCategory =
  | 'FURNITURE_AND_EQUIPMENT'
  | 'VEHICLES'
  | 'COMPUTERS'
  | 'MACHINERY'
  | 'BUILDING'
  | 'LAND'
  | 'OTHER';

export type FixedAssetStatus = 'ACTIVE' | 'FULLY_DEPRECIATED' | 'DISPOSED';

export type DepreciationMethod = 'STRAIGHT_LINE';

export interface FixedAsset {
  id: string;
  name: string;
  description: string;
  category: FixedAssetCategory;
  categoryDisplayName: string;
  accountCode: string;
  purchaseDate: string;
  purchasePrice: number;
  salvageValue: number;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  accumulatedDepreciation: number;
  netBookValue: number;
  monthlyDepreciation: number;
  depreciableAmount: number;
  status: FixedAssetStatus;
  statusDisplayName: string;
  disposalDate: string | null;
  disposalProceeds: number | null;
  createdAt: string;
  updatedAt: string;
}
