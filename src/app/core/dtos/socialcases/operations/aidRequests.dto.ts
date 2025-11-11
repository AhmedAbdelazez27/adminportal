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
  composeKey?: string | null = null;
  studyId?: string | null = null;
  caseNo?: string | null = null;
  caseCode?: string | null = null;
  entityId?: string | null = null;
  entityName?: string | null = null;
  caseId?: string | null = null;
  nameAr?: string | null = null;
  caseBirthDate?: Date | null = null;
  genderDesc?: string | null = null;
  nationalityDesc?: string | null = null;
  caseIdNumber?: string | null = null;
  brandDesc?: string | null = null;
  reqTypeDesc?: string | null = null;
  cityDesc?: string | null = null;
  sourceDesc?: string | null = null;
  statDesc?: string | null = null;
  comityDate?: Date | null = null;
  amount?: number | null = null;
  aidType?: string | null = null;
  htel?: string | null = null;
  caseBirthDateStr?: string | null = null;
  comityDateStr?: string | null = null;
  amountStr?: string | null = null;
}
export class aidRequestsShowDetailsDto {
  caseCode?: string | null = null;
  entityId?: string | null = null;
  referenceNumber?: string | null = null;
  aidRequestDate?: Date | null = null;
  aidRequestDateStr?: string | null = null;
  requestType?: string | null = null;
  requestTypeDesc?: string | null = null;
  nameAr?: string | null = null;
  nationalityDesc?: string | null = null;
  gender?: string | null = null;
  genderDesc?: string | null = null;
  caseBirthDate?: Date | null = null;
  caseBirthDateStr?: string | null = null;
  jobDesc?: string | null = null;
  healthStatusDesc?: string | null = null;
  maritalStatusDesc?: string | null = null;
  caseIdNumber?: string | null = null;
  idEndDate?: Date | null = null;
  idEndDateStr?: string | null = null;
  incomes?: string | null = null;

  htel?: string | null = null;
  mtel?: string | null = null;
  mtel2?: string | null = null;
  familyPersNo?: string | null = null;
  totIncome?: number | null = null;
  totDuties?: number | null = null;
  statusCode?: string | null = null;
  statusCodeDesc?: string | null = null;
  wifeId?: string | null = null;
  wifeName?: string | null = null;
  wifeIdEndDate?: Date | null = null;
  wifeIdEndDateStr?: string | null = null;
  caseId?: string | null = null;
  brancheCode?: number | null = null;
  brancheName?: string | null = null;
  cityId?: string | null = null;
  cityDesc?: string | null = null;
}

export class aidRequestsStudyDetailsDto {
  studyId?: string | null = null;
  entityId?: string | null = null;
  txDate?: Date | null = null;
  txDateStr?: string | null = null;
  dataEntry?: string | null = null;
  researcherName?: string | null = null;
  caseInfoBreif?: string | null = null;
  caseDescription?: string | null = null;
  mgrDecision?: string | null = null;
  caseSignature?: string | null = null;
  caseSignatureDesc?: string | null = null;
  caseCode?: string | null = null;
  caseId?: string | null = null;
  studyNo?: string | null = null;
  refrenceNo?: string | null = null;
  nameAr?: string | null = null;
  entityName?: string | null = null;
  entityNameEn?: string | null = null;
  amount?: number | null = null;
  amountStr?: string | null = null;
  categoryDesc?: string | null = null;
  headerDate?: Date | null = null;
  headerDateStr?: string | null = null;
  headerId?: string | null = null;
  headerNo?: string | null = null;
  notes?: string | null = null;
  quotationDate?: Date | null = null;
  quotationDateStr?: string | null = null;
  quotationNumber?: string | null = null;
  researcherDesc?: string | null = null;
  statusDesc?: string | null = null;
  status?: string | null = null;
  vendorName?: string | null = null;
}
export class aidRequestsZakatDto {
  headerId?: string | null = null;
  entityId?: string | null = null;
  headerNo?: string | null = null;
  statusDesc?: string | null = null;
  caseCode?: string | null = null;
  researcherDesc?: string | null = null;
  categoryDesc?: string | null = null;
  amount?: number | null = null;
  amountStr?: string | null = null;
  notes?: string | null = null;
  refrenceNo?: string | null = null;
  nameAr?: string | null = null;
  headerDate?: Date | null = null;
  headerDateStr?: string | null = null;
}
export class quotationHeaderDto {
  headerId?: string | null = null;
  entityId?: string | null = null;
  quotationNumber?: string | null = null;
  quotationDate?: Date | null = null;
  quotationDateStr?: string | null = null;
  status?: string | null = null;
  statusDesc?: string | null = null;
  caseCode?: string | null = null;
  vendorName?: string | null = null;
  refrenceNo?: string | null = null;
  nameAr?: string | null = null;
}
export class filteraidRequestsByIdDto {
  headerId: string | null = null;
  studyId: string | null = null;
  entityId: string | null = null;
  caseCode: string | null = null;
  caseId: string | null = null;
}
