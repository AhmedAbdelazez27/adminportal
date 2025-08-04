export class requestDetailsEntitiesRPTInputDto {
  orderByValue?: string | null = null;
  searchValue?: string | null = null;
  take: number | number = 10;
  skip?: number;

  entityId?: string | null = null;
  entityIdstr?: string | null = null;
  requestType?: string | null = null;
  requestTypeId?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}

export class totalRequestsEntitiesRPTInputDto {
  orderByValue?: string | null = null;
  searchValue?: string | null = null;
  take: number | number = 10;
  skip?: number;

  entityId?: string | null = null;
  entityIdstr?: string | null = null;
  requestType?: string | null = null;
  requestTypeId?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}
