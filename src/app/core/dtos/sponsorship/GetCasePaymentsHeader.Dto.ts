export class GetCasePaymentsHeaderDto {
  composeKey: string | null = null;
  paymentDesc: string | null = null;
  paymentDate: Date | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  statusCodeDesc: string | null = null;
  amountAED: number | null = null;
  giftAmount: number | null = null;
  totalAmount: number | null = null;
}

export interface IGetCasePaymentsHeaderDto {
  composeKey: string | null;
  paymentDesc: string | null;
  paymentDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  statusCodeDesc: string | null;
  amountAED: number | null;
  giftAmount: number | null;
  totalAmount: number | null;
}
