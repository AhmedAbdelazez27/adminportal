
export class FilterApPaymentsTransactionHDRDto {
  entityId: string | null = null;
  paymentNumber: string | null = null;
  paymentDate: Date | null = null;
  vendorNumber: string | null = null;
  vendorName: string | null = null;
  paymentTypeDesc: string | null = null;
  orderByValue: string = 'PAYMENT_ID asc';
  take: number|number = 10;
  skip: number = 0;

  entityIdstr: string | null = null;
  vendorNamestr: string | null = null;
  paymentTypeDescstr: string | null = null;
}



export class ApPaymentsTransactionHDRDto {
  rowCount: string | null = null;
  composeKey: string | null = null;
  paymenT_ID: string | null = null;
  entitY_ID: string | null = null;
  paymenT_NUMBER: string | null = null;
  paymenT_DATE: Date | null = null;
  paymenT_DATEstr: string | null = null;
  paymenT_TYPE: string | null = null;
  paymenT_TYPE_DESC: string | null = null;
  vendoR_NUMBER: string | null = null;
  vendoR_NAME: string | null = null;
  paymenT_AMOUNT: number | null = null;
  paymenT_AMOUNTstr: string | null = null;
  vendoR_ID: string | null = null;
  notes: string | null = null;
  paymenT_NOTES: string | null = null;
  banK_ACCOUNT: string | null = null;
  chequE_NUMBER: string | null = null;
  maturitY_DATE: Date | null = null;
  maturitY_DATEstr: string | null = null;
  posted: string | null = null;
  posteD_DESC: string | null = null;
  amounTstr: string | null = null;
}


export class FilterApPaymentsTransactionHDRByIdDto {
  paymentId: string | null = null;
  entityId: string | null = null;
}

export class PagedResult<T> {
  items?: T[];
  totalCount?: number;
}
