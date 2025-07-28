export class filterGljeListHeaderDto {
  entityId: string | null = null;
  att10: string | null = null;
  jE_NAME: string | null = null;
  att7: string | null = null;
  amount: number | null = null;
  je_Soure: string | null = null;
  je_State: Date | null = null;
  je_Curr: string | null = null;
  je_Date: string | null = null;
  OrderbyValue: string = 'ENTITY_ID';

  statusstr: string | null = null;
  entityIdstr: string | null = null;
  je_Sourestr: string | null = null;
  je_Currstr: string | null = null;

  take: number = 10;
  skip: number = 0;
}

export class GljeDetailsDto {
  JE_LINE_NO?: string;
  entitY_ID?: string;
  jE_ID?: string;
  debiT_AMOUNT?: number;
  crediT_AMOUNT?: number;
  debiT_AMOUNTstr?: string;
  crediT_AMOUNTstr?: string;
  notes?: string;
  jE_SOURCE_ID?: string;
  attributE1?: string;
  attributE2?: string;
  attributE3?: string;
  attributE4?: string;
  attributE5?: string;
  attributE6?: string;
  attributE7?: string;
  attributE8?: string;
  attributE9?: string;
  attributE10?: string;
  anotes?: string;
  linE_DATE?: string;
  sourcE_DESC_DETAILS?: string;
  atT_1?: number;
  atT_2?: number;
  atT_3?: number;
  atT_4?: number;
  atT_5?: string;
  accountnumber?: string;
  accountNameEn?: string;
  accountNameAr?: string;

}
export class gljeHeaderDto {
  jE_ID?: string;
  entitY_ID?: string;
  jE_DATE?: Date; // ISO datetime string, or use Date if you'll parse it
  jE_NOTES?: string;
  jE_SOURCE?: string;
  jE_SOURCE_DESC?: string;
  jE_NAME?: string;
  jE_CURR?: string;
  jE_CURR_DESC?: string;
  jE_RATE?: number;
  jE_STATUS?: string;
  attributE1?: string;
  attributE2?: string;
  attributE3?: string;
  attributE4?: string;
  attributE5?: string;
  attributE6?: string;
  attributE7?: string;
  attributE8?: string;
  attributE9?: string;
  attributE10?: string;
  jE_ANAME?: string;
  jE_ANOTES?: string;
  obsolate?: string;
  posteD_DATE?: string;
  totalDept?: number;
  perioD_NAME?: string;
  totalCredit?: number;
  perioD_ID?: number;

}

export class getgljeByIDDto {
  receiptId!: string;
  entityId!: string;
}
