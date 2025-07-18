export class FndLookUpValuesSelect2RequestDto {
  searchValue?: string | null = null;
  skip: number = 0;
  take: number = 999;
  orderByValue?: string | null = null;
}

export class Selectdropdown {
  result?: SelectdropdownResult;
  targetUrl?: string;
  success?: boolean;
  error?: string;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export class SelectdropdownResult {
  total: number = 0;
  results: SelectdropdownResultResults[] = [];
}

export class SelectdropdownResultResults {
  id: number = 0;
  text?: string | null = null;
  altText?: string | null = null;
}

export class Pagination {
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 2;
  pages: number[] = [];
  searchValue = '';
}
