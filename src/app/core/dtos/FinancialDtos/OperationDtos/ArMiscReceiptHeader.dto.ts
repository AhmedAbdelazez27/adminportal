export class FilterArMiscReceiptHeaderDto {
  entityId: string | null = null;
  receiptNumber: string | null = null;
  checkNumber: string | null = null;
  benificaryName: string | null = null;
  status: string | null = null;
  projectName: string | null = null;
  benName: string | null = null;
  amount: string | null = null;
  orderByValue: string = 'RECEIPT_NUMBER asc';
  take: number = 10;
  skip: number = 0;

  entityIdstr: string | null = null;
  benificaryNamestr: string | null = null;
  benNamestr: string | null = null;
  projectNamestr: string | null = null;
  statusstr: string | null = null;
}

export class ArMiscReceiptHeaderDto {
  rowsCount: string | null = null;
  composeKey: string | null = null;
  composeKeystr: string | null = null;
  misC_RECEIPT_ID: string | null = null;
  entitY_ID: string | null = null;
  receipT_NUMBER: string | null = null;
  misC_RECEIPT_DATE: Date | null = null;
  misC_RECEIPT_DATEstr: string | null = null;
  posted: string | null = null;
  postedAr: string | null = null;
  postedEn: string | null = null;
  beneficiarY_NAME: string | null = null;
  receipT_TYPE: string | null = null;
  receipT_TYPE_DESC: string | null = null;
  amount: string | null = null;
  amounTstr: string | null = null;
  sourcE_CODE: string | null = null;
  sourcE_ID: string | null = null;
  transactioN_TYPE: string | null = null;
  transactioN_TYPE_DESC: string | null = null;
  collectioN_TYPE: string | null = null;
  collectioN_TYPE_DESC: string | null = null;
  banK_ACCOUNT_NAME: string | null = null;
  collectoR_NUM: string | null = null;
  collectoR_NAME: string | null = null;
  notes: string | null = null;
}

export class ArMiscReceiptDetailsDto {
  misC_RECEIPT_DETAIL_ID: string | null = null;
  entitY_ID: string | null = null;
  misC_RECEIPT_ID: string | null = null;
  checK_NUMBER: string | null = null;
  maturitY_DATE: Date | null = null;
  maturitY_DATEstr: string | null = null;
  banK_NAME: string | null = null;
  amount: number | null = null;
  amounTstr: string | null = null;
  banK_ACCOUNT_DESC: string | null = null;
  notes: string | null = null;
  aR_MISC_RECEIPT_HEADERS?: ArMiscReceiptHeaderDto[];
}

export class ArMiscReceiptLinesDto {
  misC_RECEIPT_LINE_ID: string | null = null;
  entitY_ID: string | null = null;
  misC_RECEIPT_ID: string | null = null;
  misC_RECEIPT_AMOUNT: number | null = null;
  misC_RECEIPT_AMOUNTstr: string | null = null;
  notes: string | null = null;
  projecT_ID: string | null = null;
  administrativE_PERCENT: number | null = null;
  administrativE_PERCENTstr: string | null = null;
  receipT_TYPE: string | null = null;
  receipT_TYPE_DESC: string | null = null;
  casE_ID: string | null = null;
  manuaL_RECEIPT_NUMBER: string | null = null;
  projecT_STUDY_ID: string | null = null;
  donatoR_ID: string | null = null;
  beneficenT_ID: string | null = null;
  atT_1: string | null = null;
  atT_2: string | null = null;
  atT_3: string | null = null;
  atT_4: string | null = null;
  atT_5: string | null = null;
  donatoR_TYPE: string | null = null;
  administrativE_PERCENT1: number | null = null;
  totaPercent: number | null = null;
  totalAmount: number | null = null;
  administrativE_PERCENT1str: string | null = null;
  totaPercentstr: string | null = null;
  totalAmountstr: string | null = null;
  accountnumber: string | null = null;
  accountNameEn: string | null = null;
  accountNameAr: string | null = null;
  projecT_NUMBER: string | null = null;
  beneficentname: string | null = null;
  casename: string | null = null;
  AR_MISC_RECEIPT_HEADERS?: ArMiscReceiptHeaderDto[];
}


export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export class FilterArMiscReceiptHeaderByIdDto {
  miscReceiptId: string | null = null;
  entityId: string | null = null;
}
