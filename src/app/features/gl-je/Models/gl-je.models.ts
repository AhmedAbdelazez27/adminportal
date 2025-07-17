export interface GljeList{
composeKey?: string;
jE_ID: string;
entitY_ID : string;
attributE10? : string; 
jE_NAME?  : string;
jE_DATE?  : Date;
perioD_ID? : string;
jE_SOURCE_DESC? : string;
jE_STATUS? : string;
jE_CURR_DESC? : string;
}

export interface GljeFilter {
    entityId?: string|null,
      Att10?: string|null,
      JE_NAME?: string|null,
      Att7?: string|null,
      Amount?: number|null,
      Je_Soure?: string|null,
      Je_State?: string|null,
      Je_Curr?: string|null,
      Je_Date?: string|null,
  OrderbyValue?: string;
}
export interface Entity {
  entitY_ID?: string;
  entitY_NAME?: string;
}
export interface Je_SoureList {
  id?: string;
  text?: string;
}
export interface Je_StateList {
  id?: string;
  text?: string;
}
export interface Je_CurrList {
  id?: string;
  text?: string;
}
export interface selectedGlje{
composeKey?: string;
jE_ID?: string;
entitY_ID? : string;
attributE10? : string; 
jE_NAME?  : string;
jE_DATE?  : Date;
perioD_ID? : string;
jE_SOURCE_DESC? : string;
jE_STATUS? : string;
jE_CURR_DESC? : string;
}

export interface GlJe_trList{
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
  linE_DATE?: string; // Or Date if you're parsing it
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
export interface gljeHeaderData{
  jE_ID?: string;
entitY_ID?: string;
jE_DATE?: string; // ISO datetime string, or use Date if you'll parse it
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

}
