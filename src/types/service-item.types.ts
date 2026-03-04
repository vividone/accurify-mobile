export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  defaultPrice: number; // In naira
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItemRequest {
  name: string;
  description?: string;
  defaultPrice: number; // In naira
}
