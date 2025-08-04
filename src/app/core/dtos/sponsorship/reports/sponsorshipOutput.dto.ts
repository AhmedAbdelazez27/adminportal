export class beneficentsRptOutputDto {
  beneficenT_NO?: string | null = null;
  beneficentname?: string | null = null;
  sponceR_CATEGORY_DESC?: string | null = null;
  casE_NO?: string | null = null;
  casename?: string | null = null;
  birthdate?: Date | null = null;
  startdate?: string | null = null;
  caseamount?: string | null = null;
  sponS_FOR?: string | null = null;

  birthdatestr?: string | null = null;
  startdatestr?: string | null = null;
  caseamountstr?: string | null = null;
}

export class caseSearchRptOutputDto {
  casE_NO?: string | null = null;
  casename?: string | null = null;
  birthdate?: Date
  gender?: number;
  gendeR_DESC?: string | null = null;
  nationalitY_DESC?: string | null = null;
  casE_STATUS?: number;
  casE_STATUS_DESC?: string | null = null;
  beneficenT_NO?: string | null = null;
  beneficentname?: string | null = null;
  sponceR_CATEGORY?: number;
  sponceR_CATEGORY_DESC?: string | null = null;
  startdate?: Date;
  caseamount?: number;
  entitY_ID?: string | null = null;
  casE_ID?: string | null = null;
  beneficenT_ID?: string | null = null;
  iD_NUMBER?: string | null = null;
  birthlocation?: string | null = null;
  city?: string | null = null;
  region?: string | null = null;
  schoolstagE_DESC?: string | null = null;
  procuratoR_NAME?: string | null = null;
  procuratoR_REL_DESC?: string | null = null;
  motheR_NAME?: string | null = null;
  conT_END_DATE?: Date;
  nO_FAMILY?: string | null = null;
  housE_LEGAL_DESC?: string | null = null;
  placestatuS_DESC?: string | null = null;
  stgradE_DESC?: string | null = null;
  schooL_NAME?: string | null = null;
  study?: string | null = null;
  iS_TREATED_DESC?: string | null = null;
  casE_HEALTH_DESC?: string | null = null;
  diseaS_TYPE_DESC?: string | null = null;
  diseaS_DATE?: Date;
  treaT_AMOUNT?: number;
  traeT_STAGE?: string | null = null;
  sP_DISEASTYPE_DESC?: string | null = null;
  diseaS_PERCENT?: number;
  deatH_REASON?: string | null = null;
  fathermiss?: string | null = null;
  fatherdeathdate?: Date;
  mothermiss?: string | null = null;
  motherdeath?: Date;
  phone?: string | null = null;
  total_GIFT_AMOUNT?: number;
  total_AMOUNT_AED?: number;
  haI_OFFICE?: number;
  arabiC_VALUE?: string | null = null;
  value?: string | null = null;
  entitY_NAME?: string | null = null;


  startdatestr?: string | null = null;
  conT_END_DATEstr?: string | null = null;
  diseaS_DATEstr?: string | null = null;
  fatherdeathdatestr?: string | null = null;
  motherdeathstr?: string | null = null;
  genderstr?: string | null = null;
  casE_STATUSstr?: string | null = null;
  sponceR_CATEGORYstr?: string | null = null;
  caseamountstr?: string | null = null;
  treaT_AMOUNTstr?: string | null = null;
  diseaS_PERCENTstr?: string | null = null;
  total_GIFT_AMOUNTstr?: string | null = null;
  total_AMOUNT_AEDstr?: string | null = null;
  haI_OFFICEstr?: string | null = null;
}

export class caseSearchListRptOutputDto {
  sponceR_CATEGORY?: string | null = null;
  birthdatestr?: string | null = null;
  sponceR_CATEGORY_DESC?: string | null = null;
  casE_NO?: string | null = null;
  casename?: string | null = null;
  nationalitY_DESC?: string | null = null;
  casE_CONTRACT_STATUS?: string | null = null;
  casE_CONTRACT_STATUS_DESC?: string | null = null;
  beneficenT_NO?: string | null = null;
  beneficentname?: string | null = null;
  startdate?: Date | null = null;
  caseamount?: string | null = null;
  startdatestr?: string | null = null;
  caseamountstr?: string | null = null;
}

export class benifcientTotalRptOutputDto {
  entitY_NAME?: string | null = null;
  nationalitY_DESC?: string | null = null;
  sponsoreD_CASE?: string | null = null;
  neworofficepost?: string | null = null;
  posted?: string | null = null;
  reserved?: string | null = null;
  stoped?: string | null = null;
  neW_CASE?: string | null = null;
  total?: string | null = null;
  canceL_CASE?: string | null = null;
}

export class caseAidEntitiesRptOutputDto {
  namE_AR?: string | null = null;
  casE_ID_NUMBER?: string | null = null;
  wifE_ID?: string | null = null;
  sponceR_CATEGORY_DESC?: string | null = null;
  startdate?: string | null = null;
  caseAmount?: string | null = null;
  haI_OFFICE?: string | null = null;
  casE_STATUS_DESC?: string | null = null;
  entitY_NAME?: string | null = null;

  caseAmountstr?: string | null = null;
}

