export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  /** VAT withholding agent (oil & gas, government): keeps invoice VAT and remits it to FIRS */
  withholdsVat?: boolean;
  /** Share of the subtotal withheld as VAT (e.g. 0.05); null = the full VAT */
  vatWithholdingRate?: number | null;
  /** Client doesn't deduct WHT; the business remits it to FIRS itself */
  whtSelfRemitted?: boolean;
  createdAt: string;
}

export interface ClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  withholdsVat?: boolean;
  vatWithholdingRate?: number | null;
  whtSelfRemitted?: boolean;
}
