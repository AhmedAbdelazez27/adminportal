export class filterprojectsDto {
  searchValue?: string | null = null;
  skip?: number = 0;
  take?: number = 10;
  orderByValue?: string = "projecT_NUMBER DESC" ;

  entityId?: string | null = null;
  projectName?: string | null = null;
  status?: string | null = null;
  benificentId?: string | null = null;
  projectTypeDesc?: string | null = null;
  countryCode?: string | null = null;
  projectNumber?: string | null = null;
  applicationDate?: string | null = null;

  entityIdstr?: string | null = null;
  projectNamestr?: string | null = null;
  statusstr?: string | null = null;
  benificentIdstr?: string | null = null;
  projectTypeDescstr?: string | null = null;
  countryCodestr?: string | null = null;
  applicationDatestr?: string | null = null;
}

export class filterprojectsByIdDto {
  projectId?: string | null = null;
  entityId?: string | null = null;
}

export class projectsDto {
  rowsCount?: string | null = null;
  composeKey?: string | null = null;
  projecT_ID?: string | null = null;
  entitY_ID?: string | null = null;
  projecT_NUMBER?: string | null = null;
  applicatioN_DATE?: Date | null = null;
  projecT_NAME?: string | null = null;
  projecT_TYPE_DESC?: string | null = null;
  sC_PROJECTS_CATEGORIES_DESC?: string | null = null;
  projecT_DESC?: string | null = null;
  beneficenT_ID?: string | null = null;
  beneficiarY_NUM?: string | null = null;
  cost?: string | null = null;
  projecT_SITE?: string | null = null;
  enD_DATE?: Date | null = null;
  implementatioN_DESC?: string | null = null;
  starT_DATE?: Date | null = null;
  manG_PERCENT?: string | null = null;
  completioN_PERCENT?: string | null = null;
  status?: string | null = null;
  statuS_DESC?: string | null = null;
  donatoR_TYPE?: string | null = null;
  proJ_DESC_BENEFACTOR?: string | null = null;
  countrY_CODE?: string | null = null;
  countrY_NAME?: string | null = null;
  arabiC_COUNTRY_NAME?: string | null = null;
  receipT_NUMBER?: string | null = null;
  misC_RECEIPT_DATE?: Date | null = null;
  misC_RECEIPT_AMOUNT?: string | null = null;
  beneficiarY_NAME?: string | null = null;
  notes?: string | null = null;
  misC_RECEIPT_AMOUNTstr?: string | null = null;
  beneficenT_NO?: string | null = null;
  beneficentname?: string | null = null;
  currancY_NAME?: string | null = null;
  currancY_RATE?: string | null = null;
  currancY_RATEstr?: string | null = null;
  coststr?: string | null = null;

  applicatioN_DATEstr?: string | null = null;
  enD_DATEstr?: string | null = null;
  starT_DATEstr?: string | null = null;
  misC_RECEIPT_DATEstr?: string | null = null;
  manG_PERCENTstr?: string | null = null;
  completioN_PERCENTstr?: string | null = null;
}

export class recieptProjectsDetailsDto {
  receipT_NUMBER?: string | null = null;
  misC_RECEIPT_DATE?: Date | null = null;
  misC_RECEIPT_AMOUNT?: string | null = null;
  beneficiarY_NAME?: string | null = null;
  notes?: string | null = null;
  entitY_ID?: string | null = null;
  projecT_ID?: string | null = null;

  misC_RECEIPT_DATEstr?: string | null = null;
  misC_RECEIPT_AMOUNTstr?: string | null = null;
}

export class projectImplementDto {
  implemenT_ID?: string | null = null;
  entitY_ID?: string | null = null;
  implemenT_NUM?: string | null = null;
  imP_TYPE_DESC?: string | null = null;
  implemenT_STATUS_DESC?: string | null = null;
  implemenT_DATE?: Date | null = null;
  imP_DESC?: string | null = null;
  starT_IMPLEMENT?: Date | null = null;
  finisH_DATE?: Date | null = null;
  notes?: string | null = null;
  projecT_ID?: string | null = null;
  imP_TYPE?: string | null = null;

  implemenT_DATEstr?: string | null = null;
  starT_IMPLEMENTstr?: string | null = null;
  finisH_DATEstr?: string | null = null;
}
