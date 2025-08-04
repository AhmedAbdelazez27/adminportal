export class beneficentsRptInputDto {
  entitY_ID?: string | null = null;
  beneficenT_ID?: string | null = null;
  entitY_Name?: string | null = null;
  beneficenT_Name?: string | null = null;
  take: number | number = 10;
  skip?: number;
}

export class caseSearchListRptInputDto {
  entityId?: string | null = null;
  sponcerCatId?: string | null = null;
  nationalityDesc?: string | null = null;
  caseStatusId?: string | null = null;
  fromDate?: Date | null = null;
  toDate?: Date | null = null;

  entityName?: string | null = null;
  sponcerCatName?: string | null = null;
  nationalityDescName?: string | null = null;
  type?: string | null = null;
  caseStatusName?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
  take: number | number = 10;
  skip?: number;
}

export class caseSearchRptInputDto {
  entityId?: string | null = null;
  caseId?: string | null = null;
  entityName?: string | null = null;
  caseName?: string | null = null;
  take: number | number = 10;
  skip?: number;
}

export class benifcientTotalRptInputDto {
  entityId?: string | null = null;
  sponcerCatId?: string | null = null;
  nationalityDesc?: string | null = null;
  entityName?: string | null = null;
  sponcerCatName?: string | null = null;
  nationalityName?: string | null = null;
  take: number | number = 10;
  skip?: number;
}

export class caseAidEntitiesRptInputDto {
  caseId?: string | null = null;
  entityId?: string | null = null;
  idNumber?: string | null = null;
  caseName?: string | null = null;
  entityName?: string | null = null;
  take: number | number = 10;
  skip?: number;
}
