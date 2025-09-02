

export class filtercaseSearchDto {
  entityId: string | null = null;
  caseNo: string | null = null;
  caseID: string | null = null;
  caseStatus: string | null = null;
  benificientNo: string | null = null;
  benificientID: string | null = null;
  nationality: string | null = null;
  idNumber: string | null = null;
  sponcerCat: string | null = null;
  gender: string | null = null;
  genderdummy: Number | null = null;
  officeId: string | null = null;

  orderByValue: string = 'CASE_NO asc';
  take: number = 10;
  skip: number = 0;

  entityIdstr: string | null = null;
  caseNostr: string | null = null;
  caseIDstr: string | null = null;
  caseStatusstr: string | null = null;
  benificientNostr: string | null = null;
  benificientIDstr: string | null = null;
  nationalitystr: string | null = null;
  idNumberstr: string | null = null;
  sponcerCatstr: string | null = null;
  genderstr: string | null = null;
  officeIdstr: string | null = null;
}




export class caseSearchDto {
  rowsCount: string | null = null;
  composeKey: string | null = null;
  casE_NO: string | null = null;
  casename: string | null = null;
  birthdate: Date | null = null;
  gender: string | null = null;
  gendeR_DESC: string | null = null;
  nationalitY_DESC: string | null = null;
  casE_STATUS: string | null = null;
  casE_STATUS_DESC: string | null = null;
  beneficenT_NO: string | null = null;
  beneficentname: string | null = null;
  sponceR_CATEGORY: string | null = null;
  sponceR_CATEGORY_DESC: string | null = null;
  startdate: Date | null = null;
  caseamount: string | null = null;
  entitY_ID: string | null = null;
  casE_ID: string | null = null;
  beneficenT_ID: string | null = null;
  iD_NUMBER: string | null = null;
  contracT_ID: string | null = null;
  compCONTRACT_ID: string | null = null;
  entitY_NAME: string | null = null;

  birthlocation: string | null = null;
  city: string | null = null;
  region: string | null = null;
  schoolstagE_DESC: string | null = null;
  procuratoR_NAME: string | null = null;
  procuratoR_REL_DESC: string | null = null;
  motheR_NAME: string | null = null;
  conT_END_DATE: Date | null = null;
  nO_FAMILY: string | null = null;
  housE_LEGAL_DESC: string | null = null;
  placestatuS_DESC: string | null = null;
  stgradE_DESC: string | null = null;
  schooL_NAME: string | null = null;
  study: string | null = null;
  iS_TREATED_DESC: string | null = null;
  casE_HEALTH_DESC: string | null = null;
  diseaS_TYPE_DESC: string | null = null;
  diseaS_DATE: Date | null = null;
  treaT_AMOUNT: string | null = null;
  traeT_STAGE: string | null = null;
  sP_DISEASTYPE_DESC: string | null = null;
  diseaS_PERCENT: string | null = null;
  deatH_REASON: string | null = null;
  fathermiss: string | null = null;
  fatherdeathdate: Date | null = null;
  mothermiss: string | null = null;
  motherdeath: Date | null = null;
  phone: string | null = null;
  total_GIFT_AMOUNT: string | null = null;
  total_AMOUNT_AED: string | null = null;
  haI_OFFICE: string | null = null;
  arabiC_VALUE: string | null = null;
  value: string | null = null;

  birthdatEstr: string | null = null;
  startdatEstr: string | null = null;
  conT_END_DATEstr: string | null = null;
  diseaS_DATEstr: string | null = null;
  fatherdeathdatEstr: string | null = null;
  motherdeatHstr: string | null = null;
  caseamounTstr: string | null = null;
  diseaS_PERCENTstr: string | null = null;
  total_GIFT_AMOUNTstr: string | null = null;
  total_AMOUNT_AEDstr: string | null = null;
  treaT_AMOUNTstr: string | null = null;
  birthdatestr: string | null = null;
  startdatestr: string | null = null;
  caseamountstr: string | null = null;
}

export class getCasesHistoryDto {
  historY_CODE: string | null = null;
  entitY_ID: string | null = null;
  casE_ID: string | null = null;
  trX_DATE: Date | null = null;
  trX_DESC: string | null = null;
  sourcE_TYPE: string | null = null;
  notes: string | null = null;
  beneficenT_ID: string | null = null;
  donatoR_TYPE: string | null = null;
  sourcE_TYPE_DESC: string | null = null;
  beneficenT_NO: string | null = null;
  beneficentname: string | null = null;

  trX_DATEstr: string | null = null;
}

export class caseSearchPaymentHdrDto {
  casE_PAYMENT_CODE: string | null = null;
  entitY_ID: string | null = null;
  paymenT_CODE: string | null = null;
  paymenT_DESC: string | null = null;
  starT_DATE: Date | null = null;
  enD_DATE: Date | null = null;
  statuS_CODE: string | null = null;
  statuS_DESC: string | null = null;
  haI_OFFICE_CODE: string | null = null;
  haI_OFFICE_DESC: string | null = null;
  casE_ID: string | null = null;
  sponsoR_CATEGORY: string | null = null;
  sponsoR_CATEGORY_DESC: string | null = null;
  casE_STATUS: string | null = null;
  casE_STATUS_DESC: string | null = null;
  kafalA_STATUS: string | null = null;
  kafalA_STATUS_DESC: string | null = null;
  amounT_AED: string | null = null;
  gifT_AMOUNT: string | null = null;
  rate: string | null = null;
  notes: string | null = null;
  iS_RECEIVED: string | null = null;
  refno: string | null = null;
  deliverY_METHOD: string | null = null;
  deliverY_METHOD_DESC: string | null = null;
  receivE_DATE: Date | null = null;
  attacheD_FILE: string | null = null;

  starT_DATEstr: string | null = null;
  enD_DATEstr: string | null = null;
  receivE_DATEstr: string | null = null;
  total_GIFT_AMOUNTstr: string | null = null;
  total_AMOUNT_AEDstr: string | null = null;
  amounT_AEDstr: string | null = null;
  gifT_AMOUNTstr: string | null = null;
  totalstr: string | null = null;
}

export class getSpContractDto {
  contracT_ID: string | null = null;
  expr1: string | null = null;
  contracT_NUMBER: string | null = null;
  paymenT_METHOD: string | null = null;
  paymenT_METHOD_DESC: string | null = null;
  contracT_DATE: Date | null = null;
  beneficenT_ID: string | null = null;
  donatoR_TYPE: string | null = null;
  contracT_STATUS: string | null = null;
  contracT_STATUS_DESC: string | null = null;
  banK_ACCOUNT_NAME: string | null = null;
  notes: string | null = null;
  beneficenT_NO: string | null = null;
  beneficentname: string | null = null;
  compCONTRACT_ID: string | null = null;

  contracT_DATEstr: string | null = null;
}

export class getSpContractCasesDto {
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
  birthdate: Date | null = null;
  gendeR_DESC: string | null = null;

  startdatEstr: string | null = null;
  conT_END_DATEEstr: string | null = null;
  birthdateEstr: string | null = null;
  caseamountstr: string | null = null;
}
export class filtercaseSearchByIdDto {
  caseId: string | null = null;
  entityId: string | null = null;
  contractId: string | null = null;
}

export class PagedResult<T> {
  items?: T[];
  totalCount?: number;
}

export class loadcaseSearchNameDto {
  totalCount?: number;
  entityId!: string;
  skip = 0;
  take = 500;
  searchValue?: string | null;
}

