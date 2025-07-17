import { Data } from "@angular/router";

export class FilterApPaymentsTransactionHDRDto {
  EntityId: string = '';
  PaymentNumber: string = '';
  PaymentDate: Date | null = null;
  VendorNumber: string = '';
  VendorName: string = '';
  PaymentTypeDesc: string = '';
  OrderByValue: string = 'PAYMENT_ID asc';
  Take: number = 10;
  Skip: number = 0;
}



export class ApPaymentsTransactionHDRDto {
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
  paymenT_AMOUNT: string | null = null;
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
  PaymentId: string | null = null;
  EntityId: string | null = null;
}

export class PagedResult<T> {
  items?: T[];
  totalCount?: number;
}
