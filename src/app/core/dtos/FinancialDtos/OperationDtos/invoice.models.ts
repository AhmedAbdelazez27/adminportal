export class Invoice {
  rowsCount?: string | null = null;
  hD_INNO?: string | null = null;
  hD_DATE?: string | null = null;
  hD_DATEstr?: string | null = null;
  vendoR_NUMBER?: string | null = null;
  vendoR_NAME?: string | null = null;
  hD_TYPE_DESC?: string | null = null;
  totalVal?: number;
  hd_id?: string | null = null;
  entitY_ID?: string | null = null;
  // Add other fields as needed
}

export class InvoiceTransaction {
  tR_ITEM?: string | null = null;
  tR_TOTL?: number;
  vaT_AMOUNT?: number;
  totla?: number;
  amounT_INCLUDES_VAT?: string | null = null;
  hd_id?: string | null = null;
  atT_1?: number;
  atT_2?: number;
  atT_3?: number;
  atT_4?: number;
  atT_5?: number;
  accountnumber?: string | null = null;
  accountNameEn?: string | null = null;
  accountNameAr?: string | null = null;

  tR_TOTLstr?: string | null = null;
  vaT_AMOUNTstr?: string | null = null;
  totlastr?: string | null = null;
  atT_1str?: string | null = null;
  atT_2str?: string | null = null;
  atT_3str?: string | null = null;
  atT_4str?: string | null = null;
  atT_5str?: string | null = null;
}

export class InvoiceHeader {
  hd_id?: string | null = null;
  entitY_ID?: string | null = null;
  hD_INNO?: string | null = null;
  hD_DATE?: string | null = null;
  hD_CURR_DESC?: string | null = null;
  hD_RATE?: number;
  hD_TYPE?: string | null = null;
  hD_TYPE_DESC?: string | null = null;
  hD_COMM?: string | null = null;
  hD_STAT?: string | null = null;
  hD_STATUS_DESC?: string | null = null;
  vendoR_ID?: string | null = null;
  totalVal?: number;
  vendoR_NUMBER?: string | null = null;
  vendoR_NAME?: string | null = null;
  total_Amount?: number;
  total_TR?: number;
  hD_DATEstr?: string | null = null;
  total_Amountstr?: string | null = null;
  total_TRstr?: string | null = null;
  totalValstr?: string | null = null;
}

export class FilterInvoiceByIdDto {
  tr_Id?: string | null = null;
  entityId?: string | null = null;
}

export class InvoiceFilter {
  entityId?: string | null = null;
  invoiceNo?: string | null = null;
  invoiceDate?: string | null;
  vendorNo?: string | null = null;
  vendorName?: string | null = null;
  type?: string | null = null;
  orderByValue: string = 'hd_id asc';
  entityIdstr?: string | null = null;
  vendorNamestr?: string | null = null;
  typestr?: string | null = null;
  invoiceDatestr?: string | null = null;
  take: number | number = 10;
  skip: number = 0;
  sortColumn: string | null = null;
  sortDirection: string | null = null;
    fromDate?: string | null = null;
  toDate?: string | null = null;
} 
