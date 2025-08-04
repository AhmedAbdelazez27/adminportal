export class projectListRptInputDto {
  entityId?: string | null = null;
  entityName?: string | null = null;
  countryCode?: string | null = null;
  countryName?: string | null = null;
  typestr?: string | null = null;
  type?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;

  take: number | number = 10;
  skip?: number | number = 0;
}
