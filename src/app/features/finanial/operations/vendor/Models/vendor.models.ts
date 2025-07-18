export interface vendorList{
 composeKey?: string;
  vendoR_ID?: string;
  entitY_ID?: string;
  vendoR_NUMBER?: string;
  vendoR_NAME?: string;
  statuS_DESC?: string;
  categorY_DESC?: string;
  address?: string;
}

export interface vendorFilter {
    entityId?: string,
     VendorName?: string | null,
      Status?: string,
  OrderbyValue?: string;
}
export interface Entity {
  entitY_ID?: string;
  entitY_NAME?: string;
}
export interface VendorIDList {
  id?: string;
  text?: string;
  
}
export interface VendorStatusList {
  id?: string;
  text?: string;
}

export interface selectedvendor{
  vendoR_ID?: string;
entitY_ID?: string;
vendoR_NUMBER?: string;
vendoR_NAME?: string;
categorY_DESC?: string;
status?: string;
statuS_DESC?: string;
evaL_NOTES?: string;
address?: string;
fax?: string;
email?: string;
website?: string;
mobilE_AREA_CODE?: string;
mobile?: string;
worK_TEL?: string;
composeKey?: string;

}

