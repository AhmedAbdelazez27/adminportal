import { Data } from "@angular/router";

export class FilterArMiscReceiptHeaderDto {
  EntityId: string = '';
  ReceitpNumber: string = '';
  CheckNumber: string = '';
  BenificaryName: string = '';
  Status: string = '';
  ProjectName: string = '';
  BenName: string = '';
  Amount: string = '';
  OrderByValue: string = 'RECEIPT_NUMBER asc';
  Take: number = 10;
  Skip: number = 0;
}


export class FilterArMiscReceiptHeaderByIdDto {
  MiscReciptId: string | null = null;
  EntityId: string | null = null;
}


export class ArMiscReceiptHeaderDto {
  RowsCount: string | null = null;
  composeKey: string | null = null;
  composeKeystr: string | null = null;
  misC_RECEIPT_ID: string | null = null;
  entitY_ID: string | null = null;
  receipT_NUMBER: string | null = null;
  misC_RECEIPT_DATE: Data | null = null;
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
  maturitY_DATE: Data | null = null;
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
