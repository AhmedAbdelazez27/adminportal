

export class filterspContractsDto {
  entityId: string | null = null;
  contractId: string | null = null;
  contractDate: string | null = null;
  contractStatus: string | null = null;
  paymentMethod: string | null = null;
  beneficentNo: string | null = null;
  beneficentId: string | null = null;
  bankAccount: string | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  orderByValue: string = 'CONTRACT_NUMBER desc';
  take: number = 10;
  skip: number = 0;

  entityIdstr: string | null = null;
  contractIdstr: string | null = null;
  contractDatestr: string | null = null;
  contractStatusstr: string | null = null;
  paymentMethodstr: string | null = null;
  beneficentNostr: string | null = null;
  beneficentIdstr: string | null = null;
  bankAccountstr: string | null = null;
}




export class spContractsDto {
  rowsCount: Number | null = null;
  composeKey: string | null = null;
  caseAmountTotal: string | null = null;
  caseAmountTotalstr: string | null = null;
  contracT_NUMBER: string | null = null;
  contracT_DATE: Date | null = null;
  contracT_DATEstr: string | null = null;
  beneficenT_NO: string | null = null;
  beneficentname: string | null = null;
  contracT_STATUS_DESC: string | null = null;
  paymenT_METHOD_DESC: string | null = null;
  banK_ACCOUNT_NAME: string | null = null;
  notes: string | null = null;
}

export class spContractsCasesDto {
  contracT_CASE_ID: string | null = null;
  entitY_ID: string | null = null;
  casE_ID: string | null = null;
  sponceR_CATEGORY: string | null = null;
  sponceR_CATEGORY_DESC: string | null = null;
  casE_CONTRACT_STATUS: string | null = null;
  casE_CONTRACT_STATUS_DESC: string | null = null;
  startdate: Date | null = null;
  conT_END_DATE: Date | null = null;
  caseamount: string | null = null;
  accounT_NO: string | null = null;
  ownername: string | null = null;
  banK_DESC: string | null = null;
  contracT_ID: string | null = null;
  sponS_FOR: string | null = null;
  casename: string | null = null;
  casE_NO: string | null = null;
  nationalitY_DESC: string | null = null;
  birthdate: string | null = null;
  gendeR_DESC: string | null = null;
  startdatEstr: string | null = null;
  conT_END_DATEEstr: string | null = null;
  birthdateEstr: string | null = null;
  notes: string | null = null
}



export class filterspContractsByIdDto {
  contractId: string | null = null;
  entityId: string | null = null;
}

export class PagedResult<T> {
  items?: T[];
  totalCount?: number;
}

