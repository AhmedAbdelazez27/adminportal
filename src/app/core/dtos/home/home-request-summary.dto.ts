export interface HomeTotalRequestSummaryDto {
  totalRequests: number;
  requestSummary?: HomeRequestSummaryDto[];
}

export interface HomeRequestSummaryDto {
  totalRequest: number;
  status: string;
  percent: number;
}
