export class ordersListRptInputDto {
  skip?: number | null = 0;
  take?: number | null = 10;
  orderByValue?: string | null = null;
  searchValue?: string | null = null;

  entityId?: string | null = null;
  entityName?: string | null = null;
  brancheCode?: string | null = null;
  brancheName?: string | null = null;
  cityId?: string | null = null;
  cityDesc?: string | null = null;
  caseId?: string | null = null;
  caseName?: string | null = null;
  type?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}

export class casesEntitiesRptInputDto {
  skip?: number | null = 0;
  take?: number | null = 10;
  orderByValue?: string | null = null;
  searchValue?: string | null = null;

  caseId?: string | null = null;
  caseName?: string | null = null;
  entityId?: string | null = null;
  entityName?: string | null = null;
  idNumber?: string | null = null;
}

export class caseHelpRptInputDto {
  skip?: number | null = 0;
  take?: number | null = 10;
  orderByValue?: string | null = null;
  searchValue?: string | null = null;

  caseId?: string | null = null;
  caseName?: string | null = null;
  entityId?: string | null = null;
  entityName?: string | null = null;
  idNumber?: string | null = null;
}
