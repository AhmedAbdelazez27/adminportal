export class FilterpaymentvoucherDto {
  entityId: string | null = null;
  paymentNumber: string | null = null;
  benifetaryName: string | null = null;
  checkNumber: string | null = null;
  amount: string | null = null;
  status: string | null = null;
  orderByValue: string = 'MISC_PAYMENT_ID asc';
  take: number = 10;
  skip: number = 0;

  entityIdstr: string | null = null;
  statusstr: string | null = null;
  benifetaryNamestr: string | null = null;
}
export class FilterpaymentvoucherByIdDto {
  paymentId: string | null = null;
  entityId: string | null = null;
}
export class paymentvoucherDto {
  rowsCount: string | null = null;
  composeKey: string | null = null;
  composeKeystr: string | null = null;
  misC_PAYMENT_ID: string | null = null;
  entitY_ID: string | null = null;
  paymenT_NUMBER: string | null = null;
  beneficiarY_NAME: string | null = null;
  misC_PAYMENT_DATE: Date | null = null;
  amount: string | null = null;
  posted: string | null = null;
  postedAr: string | null = null;
  postedEn: string | null = null;
  amounTstr: string | null = null;
  misC_PAYMENT_DATEstr: string | null = null;

  banK_ACCOUNT_DESC: string | null = null;
  notes: string | null = null;
  posteD_DESC: string | null = null;
  paymenT_TYPE: string | null = null;
  paymenT_TYPE_DESC: string | null = null;
  sourcE_CODE: string | null = null;
  sourcE_ID: string | null = null;
}

export class paymentvoucherdetailsDto {
  misC_PAYMENT_DETAIL_ID: string | null = null;
  entitY_ID: string | null = null;
  misC_PAYMENT_ID: string | null = null;
  checK_NUMBER: string | null = null;
  maturitY_DATE: Date | null = null;
  beneficiarY_NAME: string | null = null;
  amount: string | null = null;
  amounTstr: string | null = null;
  maturitY_DATEstr: string | null = null;
  notes: string | null = null;
}

export class paymentvoucherlinesDto {
  misC_PAYMENT_DETAIL_ID: string | null = null;
  entitY_ID: string | null = null;
  misC_PAYMENT_ID: string | null = null;
  misC_PAYMENT_AMOUNT: string | null = null;
  notes: string | null = null;
  casE_ID: string | null = null;
  taX_NO: number | null = null;
  tR_TAX: string | null = null;
  receipT_TYPE: string | null = null;
  receipT_TYPE_DESC: string | null = null;
  atT_1: string | null = null;
  atT_2: string | null = null;
  atT_3: string | null = null;
  atT_4: string | null = null;
  atT_5: string | null = null;
  projecT_ID: string | null = null;
  taX_PERCENT: string | null = null;
  totaPercent: string | null = null;
  totalAmount: string | null = null;
  accountnumber: string | null = null;
  accountNameEn: string | null = null;
  accountNameAr: string | null = null;
  misC_PAYMENT_AMOUNTstr: string | null = null;
  totaPercentstr: string | null = null;
  totalAmountstr: string | null = null;
}

