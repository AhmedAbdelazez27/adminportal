export interface GetDataTransLogsDto {
  id: number;
  entity_ID: number;
  execute_Date: string;
  start_Date: string;
  end_Date: string | null;
  no_Try: number;
  timePeriod: string | null;
  status: string;
  error_Step: string | null;
  entitY_NAME: string; // Note: Backend returns "entitY_NAME" not "entity_NAME"
  rowsCount: number;
}

export interface GetDataTransLogsParameters extends PagedDto {
  DateFrom?: Date | null;
  DateTo?: Date | null;
}

export interface PagedDto {
  skip: number;
  take: number;
  order?: string;
  OrderByValue?: string;
}

export interface GetDataTransLogsResponse {
  totalCount: number;
  data: GetDataTransLogsDto[];
}

export interface PagedResultDto<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}
