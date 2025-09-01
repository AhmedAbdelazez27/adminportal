
export class FilterGlAccountEntityDto {
  accountDescription?: string | null = null;
  accountCode?: string | null = null;
  accountId?: string | null = null;
  entityId?: string | null = null;
  accountStatus?: string | null = null;
  orderByValue?: string | null = null;
  take: number|number = 10;
  skip: number = 0;

  accountCodestr?: string | null = null;
  accountIdstr?: string | null = null;
  entityIdstr?: string | null = null;
  accountStatusstr?: string | null = null;
}

export class FilterGlAccountEntityByCodeDto {
  id?: string | null = null
}

export class GlAccountEntityDto {
  id?: number | null = null;
  parentId?: number | null = null;
  accountCode?: string | null = null;
  parentCode?: string | null = null;
  accountDescription?: string | null = null;
  arabicDescription?: string | null = null;
  isDisabled?: string | null = null;
  natureOfAccount?: string | null = null;
  trialBalance?: string | null = null;
  profitLoss?: string | null = null;
  balanceSheet?: string | null = null;
  entityId?: string | null = null;
  accountStatus?: number | null = null;
  mappedAccountCode?: string | null = null;
  entity?: EntityDto | null = null;
  parentAccount?: GlAccountEntityDto | null = null;
  children?: GlAccountEntityDto[] = [];

}

export class FilterGlAccountEntityByEntityIdDto {
  entityId: string | null = null
  id?: number | null = null
}

 
export class CreateGlAccountEntityDto {
  entityId?: string | null = null;
  glAccountEntityId?: number | null = null;
  glAccountEntityIdstr?: string | null = null;
  accountCode?: string | null = null;
  parentCode?: string | null = null;
  accountDescription?: string | null = null;
  arabicDescription?: string | null = null;
  isDisabled?: string | null = null;
  natureOfAccount?: string | null = null;
  trialBalance?: string | null = null;
  profitLoss?: string | null = null;
  balanceSheet?: string | null = null;
  accountStatus?: number | null = null;
}

export class EntityDto {
  entitY_ID?: string | null = null;
  entitY_NAME?: string | null = null;
  entitY_NAME_EN?: string | null = null;
  entitY_LOCALTION?: string | null = null;
  entitY_PHONE?: string | null = null;
  entitY_WEBSITE?: string | null = null;
  entitY_MAIL?: string | null = null;
  acC_DETAILS_ID?: string | null = null;
}
