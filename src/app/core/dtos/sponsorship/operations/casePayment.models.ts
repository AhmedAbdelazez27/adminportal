export class filtercasePaymentDto {
  entityId?: string | null = null;
  paymentCode?: string | null = null;
  paymentStatus?: string | null = null;
  startDateCode?: string | null = null;
  endDateCode?: string | null = null;
  officeid?: string | null = null;
  searchValue?: string | null = null;
  skip?: number | null = 0;
  take?: number | null = 10;
  orderByValue?: string = "PAYMENT_DESC desc";

  entityIdstr?: string | null = null;
  paymentCodestr?: string | null = null;
  paymentStatusstr?: string | null = null;
  startDateCodestr?: string | null = null;
  endDateCodestr?: string | null = null;
  officeidstr?: string | null = null;
}

export class filtercasePaymentByIdDto {
  entityId?: string | null = null;
  paymentCode?: string | null = null;
}
export class filtercasePaymentBycomposeKeyDto {
  composeKey?: string | null = null;
}
export class casePaymentDto {
  rowsCount?: string | null = null;
  composeKey?: string | null = null;
  paymenT_DESC?: string | null = null;
  paymenT_DATE?: string | null = null;
  starT_DATE?: string | null = null;
  enD_DATE?: string | null = null;
  statuS_CODE_DESC?: string | null = null;
  amounT_AED?: string | null = null;
  gifT_AMOUNT?: string | null = null;
  totalAmount?: string | null = null;
  paymenT_DATEstr?: string | null = null;
  starT_DATEstr?: string | null = null;
  enD_DATEstr?: string | null = null;
  amounT_AEDstr?: string | null = null;
  gifT_AMOUNTstr?: string | null = null;
  totalAmountstr?: string | null = null;
}

export class casePaymentHdrDto {
  casE_PAYMENT_CODE?: string | null = null;
  entitY_ID?: string | null = null;
  paymenT_CODE?: string | null = null;
  paymenT_DESC?: string | null = null;
  starT_DATE?: Date | null = null;
  enD_DATE?: Date | null = null;
  statuS_CODE?: number | null = 1;
  statuS_DESC?: string | null = null;
  haI_OFFICE_CODE?: string | null = null;
  haI_OFFICE_DESC?: string | null = null;
  casE_ID?: string | null = null;
  casE_NO?: string | null = null;
  casename?: string | null = null;
  sponsoR_CATEGORY?: number | null = 1;
  sponsoR_CATEGORY_DESC?: string | null = null;
  casE_STATUS?: number | null = 1;
  casE_STATUS_DESC?: string | null = null;
  kafalA_STATUS?: number | null = 1;
  kafalA_STATUS_DESC?: string | null = null;
  amounT_AED?: number | null = 1;
  gifT_AMOUNT?: number | null = 1;
  rate?: number | null = 1;
  notes?: string | null = null;
  iS_RECEIVED?: number | null = 1;
  refno?: string | null = null;
  deliverY_METHOD?: string | null = null;
  deliverY_METHOD_DESC?: string | null = null;
  receivE_DATE?: Date | null = null;
  attacheD_FILE?: string | null = null;
  starT_DATEstr?: string | null = null;
  enD_DATEstr?: string | null = null;
  receivE_DATEstr?: string | null = null;
  amounT_AEDstr?: string | null = null;
  gifT_AMOUNTstr?: string | null = null;
  totalstr: string | null = null;
}
