export interface Invoice {
  hD_INNO?: string;
  hD_DATE?: string;
  vendoR_NUMBER?: string;
  vendoR_NAME?: string;
  hD_TYPE_DESC?: string;
  totalVal?: number;
  hd_id?: string;
  entitY_ID?: string;
  // Add other fields as needed
}

export interface InvoiceTransaction {
  accountnumber?: string;
  accountNameAr?: string;
  tR_ITEM?: string;
  tR_TOTL?: number;
  vaT_AMOUNT?: number;
  totla?: number;
  // Add other fields as needed
}

export interface InvoiceHeader {
  hD_INNO?: string;
  hD_STATUS_DESC?: string;
  vendoR_NAME?: string;
  hD_DATE?: string;
  hD_CURR_DESC?: string;
  hD_RATE?: number;
  hD_TYPE_DESC?: string;
  total_TRstr?: string;
  total_Amountstr?: string;
  totalValstr?: string;
  // Add other fields as needed
}

export interface Vendor {
  text?: string;
  // Add other fields as needed
}

export interface Entity {
  entitY_ID?: string;
  entitY_NAME?: string;
  // Add other fields as needed
}

export interface InvoiceType {
  id?: string;
  text?: string;
  // Add other fields as needed
}

export interface InvoiceFilter {
  entityId: string;
  invoiceNo: string;
  invoiceDate: string;
  vendorNo: string;
  vendorName: string;
  type: string;
  OrderbyValue: string;
} 