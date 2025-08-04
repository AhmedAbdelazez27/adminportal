export class ordersListRptOutputDto {
  referencenumber?: string | null = null;
  aiD_REQUEST_DATE?: Date | null = null;
  requesT_TYPE_DESC?: string | null = null;
  namE_AR?: string | null = null;
  casE_ID_NUMBER?: string | null = null;
  familY_PERS_NO?: string | null = null;
  toT_INCOME?: string | null = null;
  toT_DUTIES?: string | null = null;
  brancH_DESC?: string | null = null;
  branchE_CODE?: string | null = null;
  statuscodE_DESC?: string | null = null;
  citY_DESC?: string | null = null;
  citY_ID?: string | null = null;

  aiD_REQUEST_DATEstr?: string | null = null;
  toT_INCOMEstr?: string | null = null;
  toT_DUTIESstr?: string | null = null;
}

export class casesEntitiesRptOutputDto {
  namE_AR?: string | null = null;
  casE_ID_NUMBER?: string | null = null;
  wifE_ID?: string | null = null;
  sourcE_DESC?: string | null = null;
  comitY_DATE?: Date | null = null;
  aiD_TYPE?: string | null = null;
  statuS_DESC?: string | null = null;
  entitY_NAME?: string | null = null;
  ord?: string | null = null;

  comitY_DATEstr?: string | null = null;
}

export class caseHelpRptOutputDto {
  namE_AR?: string | null = null;
  casE_ID_NUMBER?: string | null = null;
  wifE_ID?: string | null = null;
  sourcE_DESC?: string | null = null;
  comitY_DATE?: Date | null = null;
  aiD_TYPE?: string | null = null;
  statuS_DESC?: string | null = null;
  entitY_NAME?: string | null = null;

  comitY_DATEstr?: string | null = null
}
