export interface TaxSummary {
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
  whtPayable: number;
  accountsReceivable: number;
  accountsPayable: number;
  unpaidInvoicesCount: number;
  unpaidBillsCount: number;
}
