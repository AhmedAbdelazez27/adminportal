export class catchReceiptRptOutputDto {
  banK_ACCOUNT_NAME?: string | null = null;
  beneficiarY_NAME?: string | null = null;
  notes?: string | null = null;
  transactioN_TYPE_DESC?: string | null = null;
  receipT_NUMBER?: string | null = null;
  misC_RECEIPT_DATE?: Date | null = null;
  receipT_AMOUNT?: string | null = null;
  chequE_AMOUNT?: string | null = null;
  cashcasH_AMOUNTAmount?: string | null = null;
  administrativE_AMOUNT?: string | null = null;
  collectoR_NAME?: string | null = null;

  misC_RECEIPT_DATEstr?: string | null = null;
  receipT_AMOUNTstr?: string | null = null;
  chequE_AMOUNTstr?: string | null = null;
  casH_AMOUNTstr?: string | null = null;
  administrativE_AMOUNTstr?: string | null = null;
}

export class generalLJournalRptOutputDto {
  accountT_CODE?: string | null = null;
  accounT_NAME?: string | null = null;
  jE_NAME?: string | null = null;
  jE_DATE?: string | null = null;
  jE_DATEstr?: string | null = null;
  jE_SOURCE_DESC?: string | null = null;
  notes?: string | null = null;
  debiT_AMOUNT?: string | null = null;
  crediT_AMOUNT?: string | null = null;
  roW_TYPE?: string | null = null;

  debiT_AMOUNTstr?: string | null = null;
  crediT_AMOUNTstr?: string | null = null;
}

export class receiptRPTOutputDto {
  paymenT_CATEGORY?: string | null = null;
  paymenT_NUMBER?: string | null = null;
  beneficiarY_NAME?: string | null = null;
  paymenT_DATE?: Date | null = null;
  paymenT_TYPE?: string | null = null;
  amount?: string | null = null;
  notes?: string | null = null;
  banK_ACCOUNT?: string | null = null;

  paymenT_DATEstr?: string | null = null;
  amounTstr?: string | null = null;
}

export class vendorsPayTransRPTOutputDto {
  vendoR_NUMBER?: string | null = null;
  vendoR_NAME?: string | null = null;
  address?: string | null = null;
  worK_TEL?: string | null = null;
  fax?: string | null = null;
  trX_TYPE?: string | null = null;
  hD_INNO?: string | null = null;
  hD_COMM?: string | null = null;
  hD_DATE?: Date | null = null;
  debiT_AMOUNT?: string | null = null;
  crediT_AMOUNT?: string | null = null;

  hD_DATEstr?: string | null = null;
  debiT_AMOUNTstr?: string | null = null;
  crediT_AMOUNTstr?: string | null = null;
}


export class getTotlaBenDonationsRPTOutputDto {
  beneficenT_ID?: string | null = null;
  beneficentname?: string | null = null;
  beneficenT_NO?: string | null = null;
  receipT_NUMBER?: string | null = null;
  misC_RECEIPT_DATE?: string | null = null;
  receipT_TYPE_DESC?: string | null = null;
  notes?: string | null = null;
  misC_RECEIPT_AMOUNT?: string | null = null;
  administrative?: string | null = null;

  misC_RECEIPT_DATEstr?: string | null = null;
  misC_RECEIPT_AMOUNTstr?: string | null = null;
  administrativEstr?: string | null = null;
}


export class balanceReviewRptOutputDto {
  level_desc?: string | null = null;
  acc_code?: string | null = null;
  acC_DESC?: string | null = null;
  amount?: string | null = null;
  balance?: string | null = null;
  debit?: string | null = null;
  credit?: string | null = null;
  ob_debit?: string | null = null;
  ob_credit?: string | null = null;
  entity_id?: string | null = null;
  user_id?: string | null = null;
  rn?: string | null = null;
  deptOBCalc?: string | null = null;
  creditOBCalc?: string | null = null;
  endDept?: string | null = null;
  endCredit?: string | null = null;
  oB_Amount?: string | null = null;
}
