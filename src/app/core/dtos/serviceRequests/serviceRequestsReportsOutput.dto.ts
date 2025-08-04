export class requestDetailsEntitiesRPTOutputDto {
  requestNo?: string | null = null;
  requestDate?: Date | null = null;
  startDate?: Date | null = null;
  endDate?: Date | null = null;
  requestType?: string | null = null;
  entity?: string | null = null;
  requestName?: string | null = null;
  requestStatus?: string | null = null;
  permissionNo?: string | null = null;
  targetedAmount?: string | null = null;

  requestDatestr?: string | null = null;
  startDatestr?: string | null = null;
  endDatestr?: string | null = null;
  targetedAmountstr?: string | null = null;
}

export class totalRequestsEntitiesRPTOutputDto {
  entity?: string | null = null;
  requestType?: string | null = null;
  rejectedRequestsNo?: string | null = null;
  postedRequestsNo?: string | null = null;
}
