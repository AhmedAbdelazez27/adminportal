import { GlAccountSelectionType } from "../../../enum/user-type.enum";

export class catchReceiptRptInputDto {
  entityId?: string | null = null;
  collectorName?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
  fromNo?: string | null = null;
  toNo?: string | null = null;
  type?: string | null = null;
  take: number | number = 10;
  skip?: number;
  typestr?: string | null = null;
  entityIdstr?: string | null = null;
  collectorNamestr?: string | null = null;
}

export class generalLJournalRptInputDto {
  entityId?: string | null = null;
  att1?: number | null = 1;
  att2?: number | null = 1;
  att3?: number | null = 1;
  att4?: number | null = 1;
  att5From?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  att5To?: string | null = null;
  take: number | number = 10;
  skip?: number;
  entityIdstr?: string | null = null;
  att1str?: string | null = null;
  att2str?: string | null = null;
  att3str?: string | null = null;
  att4str?: string | null = null;
  att5Fromstr?: string | null = null;
  att5Tostr?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}

export class balanceReviewRptInputDto {
  level?: number | null = null;
  user_ID?: string | null = null;
  take: number | number = 10;
  skip?: number;
  orderByValue?: string | null = null;
  searchValue?: string | null = null;
}

export class prepareGlAccountRptRequestDto {
  entities: updateGlAccountSelectionDto[] = [];
  fromPeriodId?: number | null = null;
  toPeriodId?: number | null = null;
}

export class updateGlAccountSelectionDto {
  accountSelectionType?: GlAccountSelectionType;
  yesNo?: string | null = null;
  fromValue?: string | null = null;
  toValue?: string | null = null;
}
export class updateGlAccountSelectiondummyDto {
  entityyesNo?: string | null = null;
  countryyesNo?: string | null = null;
  branchyesNo?: string | null = null;
  accountyesNo?: string | null = null;
  departmentyesNo?: string | null = null;
}
export class receiptRPTInputDto {
  entityId?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  fromNo?: string | null = null;
  toNo?: string | null = null;
  take: number | number = 10;
  skip?: number;
  entityIdstr?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}

export class vendorsPayTransRPTInputDto {
  entityId?: string | null = null;
  vendorId?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  take: number | number = 10;
  skip?: number;
  entityIdstr?: string | null = null;
  vendorIdstr?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}

export class getTotlaBenDonationsRPTInputDto {
  entityId?: string | null = null;
  beneficenT_ID?: string | null = null;
  fromDate?: string | null = null;
  toDate?: string | null = null;
  take: number | number = 10;
  skip?: number;
  entityIdstr?: string | null = null;
  beneficentIdstr?: string | null = null;
  fromDatestr?: string | null = null;
  toDatestr?: string | null = null;
}
