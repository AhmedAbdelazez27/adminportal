
export class FilterGlAccountDto {
  accountDescription?: string | null = null;
  accountCode?: string | null = null;
  orderByValue?: string | null = null;
  take: number|number = 10;
  skip: number = 0;
}

export class FilterGlAccountByCodeDto {
  accountCode?: string | null = null
}

export class GlAccountDto {
  accountCode?: string | null = null;
  parentCode?: string | null = null;
  accountDescription?: string | null = null;
  arabicDescription?: string | null = null;
  isDisabled?: string | null = null;
  natureOfAccount?: string | null = null;
  trialBalance?: string | null = null;
  profitLoss?: string | null = null;
  balanceSheet?: string | null = null;
  children?: GlAccountDto[];

}


export class CreateGlAccountDto {
  accountCode?: string | null = null;
  parentCode?: string | null = null;
  accountDescription?: string | null = null;
  arabicDescription?: string | null = null;
  isDisabled?: string | null = null;
  natureOfAccount?: string | null = null;
  trialBalance?: string | null = null;
  profitLoss?: string | null = null;
  balanceSheet?: string | null = null;
}
