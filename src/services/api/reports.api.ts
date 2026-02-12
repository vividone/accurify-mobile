import apiClient from './client';

const REPORTS_BASE = '/reports';

export interface ReportParams {
  businessId: string;
  from: string;
  to: string;
}

export const reportsApi = {
  /**
   * Generate and download a financial report PDF
   */
  getFinancialReportPdf: async (params: ReportParams): Promise<Blob> => {
    const queryParams = new URLSearchParams({
      businessId: params.businessId,
      from: params.from,
      to: params.to,
    });

    const response = await apiClient.get(`${REPORTS_BASE}/financial?${queryParams}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate and download a tax exemption report PDF
   */
  getExemptionReportPdf: async (params: ReportParams): Promise<Blob> => {
    const queryParams = new URLSearchParams({
      businessId: params.businessId,
      from: params.from,
      to: params.to,
    });

    const response = await apiClient.get(`${REPORTS_BASE}/exemption?${queryParams}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
