

export class filteraidRequestsDto {
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
  gender: string | null = null;
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
  wifeIdNo: string | null = null;
  wifeIdNostr: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
}

export class aidRequestsDto {
  aiD_TYPE?: string | null = null;
  amount?: string | null = null;
  amountstr?: string | null = null;
  brancH_DESC?: string | null = null;
  casE_BIRTH_DATE?: Date | null = null;
  casE_BIRTH_DATEstr?: string | null = null;
  casE_ID_NUMBER?: string | null = null;
  casE_NO?: string | null = null;
  citY_DESC?: string | null = null;
  comitY_DATE?: Date | null = null;
  comitY_DATEstr?: string | null = null;
  composeKey?: string | null = null;
  entitY_NAME?: string | null = null;
  entity_ID?: string | null = null;
  gendeR_DESC?: string | null = null;
  namE_AR?: string | null = null;
  nationalitY_DESC?: string | null = null;
  requesT_TYPE_DESC?: string | null = null;
  rowsCount?: string | null = null;
  sourcE_DESC?: string | null = null;
  statuS_DESC?: string | null = null;
}

export class aidRequestsShowDetailsDto {
  aiD_REQUEST_DATE?: Date | null = null;
  aiD_REQUEST_DATEstr?: string | null = null;
  branchE_CODE?: string | null = null;
  branchE_NAME?: string | null = null;
  casE_BIRTH_DATE?: Date | null = null;
  casE_BIRTH_DATEstr?: string | null = null;
  casE_ID?: string | null = null;
  casE_ID_NUMBER?: string | null = null;
  casE_CODE?: string | null = null;
  casE_SIGNATURE?: string | null = null;
  casE_SIGNATURE_DESC?: string | null = null;
  citY_DESC?: string | null = null;
  citY_ID?: string | null = null;
  familY_PERS_NO?: string | null = null;
  gendeR_DESC?: string | null = null;
  gender?: string | null = null;
  healtH_STATUS_DESC?: string | null = null;
  htel?: string | null = null;
  iD_END_DATE?: Date | null = null;
  iD_END_DATEstr?: string | null = null;
  incomes?: string | null = null;
  joB_DESC?: string | null = null;
  maritaL_STATUS_DESC?: string | null = null;
  mtel?: string | null = null;
  mteL2?: string | null = null;
  namE_AR?: string | null = null;
  nationalitY_DESC?: string | null = null;
  referencenumber?: string | null = null;
  requesT_TYPE?: string | null = null;
  requesT_TYPE_DESC?: string | null = null;
  statuscode?: string | null = null;
  statuscodE_DESC?: string | null = null;
  toT_DUTIES?: string | null = null;
  toT_INCOME?: string | null = null;
  wifE_ID?: string | null = null;
  wifE_NAME?: string | null = null;
  wifeiD_END_DATE?: Date | null = null;
  wifeiD_END_DATEstr?: string | null = null;
  entitY_ID?: string | null = null;
}

export class aidRequestsStudyDetailsDto {
  amount?: string | null = null;
  amountstr?: string | null = null;
  categorY_DESC?: string | null = null;
  casE_CODE?: string | null = null;
  casE_DESCRIPTION?: string | null = null;
  casE_ID?: string | null = null;
  casE_INFO_BREIF?: string | null = null;
  casE_SIGNATURE?: string | null = null;
  casE_SIGNATURE_DESC?: string | null = null;
  datA_ENTRY?: string | null = null;
  entitY_ID?: string | null = null;
  entitY_NAME?: string | null = null;
  entitY_NAME_EN?: string | null = null;
  headeR_DATE?: Date | null = null;
  headeR_DATEstr?: string | null = null;
  headeR_ID?: string | null = null;
  headeR_NO?: string | null = null;
  mgR_DECEISION?: string | null = null;
  namE_AR?: string | null = null;
  notes?: string | null = null;
  quotatioN_DATE?: Date | null = null;
  quotatioN_DATEstr?: string | null = null;
  quotatioN_NUMBER?: string | null = null;
  refrenceNo?: string | null = null;
  researcheR_DESC?: string | null = null;
  researcheR_NAME?: string | null = null;
  statuS_DESC?: string | null = null;
  status?: string | null = null;
  studY_ID?: string | null = null;
  studY_NO?: string | null = null;
  tX_DATE?: Date | null = null;
  tX_DATEstr?: string | null = null;
  vendoR_NAME?: string | null = null;
}


export class filteraidRequestsByIdDto {
  headerId: string | null = null;
  entityId: string | null = null;
  caseCode: string | null = null;
  caseId: string | null = null;
}


