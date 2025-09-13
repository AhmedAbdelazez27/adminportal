// DTOs for SpCases operations

export class GetGridDataParametersDto {
  entityId: string | null = null;
  entityIdstr: string | null = null;
  caseId: string | null = null;
  caseIdstr: string | null = null;
  caseName: string | null = null;
  caseNamestr: string | null = null;
  nationality: string | null = null;
  nationalitystr: string | null = null;
  idNumber: string | null = null;
  idNumberstr: string | null = null;
  gender: number | null = null;
  genderstr: string | null = null;
  phone: string | null = null;
  phonestr: string | null = null;
  city: string | null = null;
  citystr: string | null = null;
  skip: number = 0;
  take: number = 10;
  orderByValue: string = 'CaseId desc';
}

// New DTOs for AidRequest API for the sp case main grid 
export class GetAidRequestGridDataParametersDto {
  entityId: string | null = null;
  caseNo: string | null = null;
  wifeIdNo: string | null = null;
  caseIdNo: string | null = null;
  phone: string | null = null;
  caseId: string | null = null;
  branch: string | null = null;
  nationality: string | null = null;
  city: string | null = null;
  gender: string | null = null;
  aidType: string | null = null;
  source: string | null = null;
  skip: number = 0;
  take: number = 10;
}

export class CAidRequestDto {
  caseId: string = '';
  entityId: string = '';
  appDate?: Date | null = null;
  caseIdNumber?: string | null = null;
  brancheCode?: string | null = null;
  branchDesc?: string | null = null;
  appType?: number | null = null;
  appTypeDesc?: string | null = null;
  caseNo?: string | null = null;
  nameAr?: string | null = null;
  wifeId?: string | null = null;
  wifeName?: string | null = null;
  gender?: string | null = null;
  genderDesc?: string | null = null;
  maritalStatusDesc?: string | null = null;
  caseBirthDate?: Date | null = null;
  healthStatusDesc?: string | null = null;
  eduLvlDesc?: string | null = null;
  jobDesc?: string | null = null;
  nationalityDesc?: string | null = null;
  passportNo?: string | null = null;
  resdNo?: string | null = null;
  resdEndDate?: Date | null = null;
  htel?: string | null = null;
  mtel?: string | null = null;
  wtel1?: string | null = null;
  mtel2?: string | null = null;
  wtel2?: string | null = null;
  familyPersNo?: string | null = null;
  totIncome?: number | null = null;
  totDuties?: number | null = null;
  cityId?: string | null = null;
  cityDesc?: string | null = null;
  regionName?: string | null = null;
  streetName?: string | null = null;
  idEndDate?: Date | null = null;
  requestStatusDesc?: string | null = null;
  nationalityType?: number | null = null;
  
  // Formatted string properties
  appDatestr?: string | null = null;
  caseBirthDatestr?: string | null = null;
  resdEndDatestr?: string | null = null;
  idEndDatestr?: string | null = null;
  totIncomestr?: string | null = null;
  totDutiesstr?: string | null = null;
}

export class SpCasesDto {
  caseId: string = '';
  entityId: string = '';
  caseName?: string | null = null;
  caseNo?: string | null = null;
  nationalityDesc?: string | null = null;
  gender?: number | null = null;
  genderDesc?: string | null = null;
  birthLocation?: string | null = null;
  birthDate?: Date | null = null;
  city?: string | null = null;
  region?: string | null = null;
  sponcerCategory?: number | null = null;
  sponcerCategoryDesc?: string | null = null;
  idNumber?: string | null = null;
  caseStatus?: number | null = null;
  caseStatusDesc?: string | null = null;
  procuratorName?: string | null = null;
  procuratorRelDesc?: string | null = null;
  motherName?: string | null = null;
  study?: string | null = null;
  stgradeDesc?: string | null = null;
  schoolName?: string | null = null;
  schoolstageDesc?: string | null = null;
  isTreatedDesc?: string | null = null;
  caseHealthDesc?: string | null = null;
  diseasTypeDesc?: string | null = null;
  diseasDate?: Date | null = null;
  treatAmount?: number | null = null;
  traetStage?: string | null = null;
  spDiseasTypeDesc?: string | null = null;
  diseasPercent?: number | null = null;
  noFamily?: string | null = null;
  houseLegalDesc?: string | null = null;
  placestatusDesc?: string | null = null;
  deathReason?: string | null = null;
  fatherMiss?: string | null = null;
  fatherDeathDate?: Date | null = null;
  motherMiss?: string | null = null;
  motherDeath?: Date | null = null;
  phone?: string | null = null;
  haiOffice?: number | null = null;
  entity?: EntityDto | null = null;
  
  // Formatted string properties
  birthDatestr?: string | null = null;
  diseasDatestr?: string | null = null;
  fatherDeathDatestr?: string | null = null;
  motherDeathstr?: string | null = null;
  treatAmountstr?: string | null = null;
  diseasPercentstr?: string | null = null;
}

export class EntityDto {
  entitY_ID?: string | null = null;
  entitY_NAME?: string | null = null;
  entitY_NAME_EN?: string | null = null;
  entitY_LOCALTION?: string | null = null;
  entitY_PHONE?: string | null = null;
  entitY_WEBSITE?: string | null = null;
  entitY_MAIL?: string | null = null;
  acC_DETAILS_ID?: string | null = null;
  descriptionAr?: string | null = null;
  descriptionEn?: string | null = null;
  isShowInPortal?: boolean | null = null;
  isDonation?: boolean | null = null;
  active?: boolean | null = null;
  masterId?: number | null = null;
  attachment?: any | null = null;
}

export class CasesSearchDto {
  // API response field names (exact match)
  casE_NO?: string | null = null;
  casename?: string | null = null;
  birthdate?: Date | null = null;
  gender?: number | null = null;
  gendeR_DESC?: string | null = null;
  nationalitY_DESC?: string | null = null;
  casE_STATUS?: number | null = null;
  casE_STATUS_DESC?: string | null = null;
  beneficenT_NO?: string | null = null;
  beneficentname?: string | null = null;
  sponceR_CATEGORY?: number | null = null;
  sponceR_CATEGORY_DESC?: string | null = null;
  startdate?: Date | null = null;
  caseamount?: number | null = null;
  entitY_ID?: string | null = null;
  casE_ID?: string | null = null;
  beneficenT_ID?: string | null = null;
  iD_NUMBER?: string | null = null;
  birthlocation?: string | null = null;
  city?: string | null = null;
  region?: string | null = null;
  schoolstagE_DESC?: string | null = null;
  procuratoR_NAME?: string | null = null;
  procuratoR_REL_DESC?: string | null = null;
  motheR_NAME?: string | null = null;
  conT_END_DATE?: Date | null = null;
  nO_FAMILY?: string | null = null;
  housE_LEGAL_DESC?: string | null = null;
  placestatuS_DESC?: string | null = null;
  stgradE_DESC?: string | null = null;
  schooL_NAME?: string | null = null;
  study?: string | null = null;
  iS_TREATED_DESC?: string | null = null;
  casE_HEALTH_DESC?: string | null = null;
  diseaS_TYPE_DESC?: string | null = null;
  diseaS_DATE?: Date | null = null;
  treaT_AMOUNT?: number | null = null;
  traeT_STAGE?: string | null = null;
  sP_DISEASTYPE_DESC?: string | null = null;
  diseaS_PERCENT?: number | null = null;
  deatH_REASON?: string | null = null;
  fathermiss?: string | null = null;
  fatherdeathdate?: Date | null = null;
  mothermiss?: string | null = null;
  motherdeath?: Date | null = null;
  phone?: string | null = null;
  total_GIFT_AMOUNT?: number = 0;
  total_AMOUNT_AED?: number = 0;
  haI_OFFICE?: number | null = null;
  arabiC_VALUE?: string | null = null;
  value?: string | null = null;
  entitY_NAME?: string | null = null;

  // Formatted string properties (exact match from API)
  birthdatEstr?: string | null = null;
  startdatEstr?: string | null = null;
  conT_END_DATEstr?: string | null = null;
  diseaS_DATEstr?: string | null = null;
  fatherdeathdatEstr?: string | null = null;
  motherdeatHstr?: string | null = null;
  caseamounTstr?: string | null = null;
  diseaS_PERCENTstr?: string | null = null;
  total_GIFT_AMOUNTstr?: string | null = null;
  total_AMOUNT_AEDstr?: string | null = null;
  treaT_AMOUNTstr?: string | null = null;
}

export class GetParamtersDto {
  caseId: string = '';
  entityId: string = '';
}

export class SpCasesAidRequestsFilterDto {
  aidType: string | null = null;
  aidTypestr: string | null = null;
  branch: string | null = null;
  branchstr: string | null = null;
  caseIdNo: string | null = null;
  caseIdNostr: string | null = null;
  caseName: string | null = null;
  caseNamestr: string | null = null;
  caseNo: string | null = null;
  caseNostr: string | null = null;
  city: string | null = null;
  citystr: string | null = null;
  entityId: string | null = null;
  entityIdstr: string | null = null;
  gender: number | null = null;
  genderstr: string | null = null;
  nationality: string | null = null;
  nationalitystr: string | null = null;
  orderByValue: string = 'details1.CASE_CODE asc';
  phone: string | null = null;
  phonestr: string | null = null;
  skip: number = 0;
  source: string | null = null;
  sourcestr: string | null = null;
  take: number = 10;
}
