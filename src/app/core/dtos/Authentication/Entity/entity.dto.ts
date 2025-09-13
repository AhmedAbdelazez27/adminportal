export interface EntityDto {
  ENTITY_ID: string;
  ENTITY_NAME: string;
  ENTITY_NAME_EN?: string;
  ENTITY_LOCALTION?: string;
  ENTITY_PHONE?: string;
  ENTITY_WEBSITE?: string;
  ENTITY_MAIL?: string;
  ACC_DETAILS_ID?: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  IsShowInPortal: boolean;
  IsDonation?: boolean;
  Active?: boolean;
  MasterId: number; // Changed to long type to match backend
  Attachment?: AttachmentDto; // Single attachment object from API response
  licenseNumber?: string | null;
  licenseEndDate?: string | null;
  foundationType?: number | string | null;
}

// Backend response structure (for mapping purposes)
export interface BackendEntityDto {
  entitY_ID: string;
  entitY_NAME: string;
  entitY_NAME_EN?: string;
  entitY_LOCALTION?: string;
  entitY_PHONE?: string;
  entitY_WEBSITE?: string;
  entitY_MAIL?: string;
  acC_DETAILS_ID?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isShowInPortal: boolean;
  isDonation?: boolean;
  active?: boolean;
  masterId: number; // Changed to long type to match backend
  attachment?: AttachmentDto; // Single object, not array
}

export interface CreateEntityDto {
  ENTITY_NAME: string;
  ENTITY_NAME_EN: string;
  ENTITY_LOCALTION?: string;
  ENTITY_PHONE?: string;
  ENTITY_WEBSITE?: string;
  ENTITY_MAIL?: string;
  ACC_DETAILS_ID?: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  IsShowInPortal: boolean; // Changed from optional to required boolean
  IsDonation?: boolean;
  Active?: boolean;
  Attachment?: AttachmentBase64Dto;
  licenseNumber?: string | null;
  licenseEndDate?: string | null;
  foundationType?: number | string | null;
}

export interface UpdateEntityDto {
  ENTITY_ID: string;
  ENTITY_NAME?: string;
  ENTITY_NAME_EN?: string;
  ENTITY_LOCALTION?: string;
  ENTITY_PHONE?: string;
  ENTITY_WEBSITE?: string;
  ENTITY_MAIL?: string;
  ACC_DETAILS_ID?: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  IsShowInPortal: boolean; // Changed from optional to required boolean
  IsDonation?: boolean;
  Active?: boolean;
  licenseNumber?: string | null;
  licenseEndDate?: string | null;
  foundationType?: number | string | null;
}

export interface GetEntityByIdDto {
  ENTITY_ID: string;
  ENTITY_NAME: string;
  ENTITY_NAME_EN?: string;
  ENTITY_LOCALTION?: string;
  ENTITY_PHONE?: string;
  ENTITY_WEBSITE?: string;
  ENTITY_MAIL?: string;
  ACC_DETAILS_ID?: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  IsShowInPortal: boolean;
  IsDonation?: boolean;
  Active?: boolean;
  MasterId: number; // Changed to long type to match backend
  Attachment?: AttachmentDto; // Single attachment object from API response
}

export interface GetAllEntitiesResponseDto {
  totalCount: number;
  data: EntityDto[];
}

export interface EntityParameter {
  searchValue?: string;
  entityId?: string;
  isShowInPortal: boolean;
  isDonation?: boolean;
  active?: boolean;
  skip: number;
  take: number;
}

export interface PagedResultDto<T> {
  totalCount: number;
  items: T[];
}

export interface Select2RequestDto {
  searchValue?: string;
  skip: number;
  take: number;
  orderByValue?: string;
}

export interface Select2Result {
  total: number;
  results: Select2ResultItem[];
}

export interface Select2ResultItem {
  id: string;
  text: string;
  altText?: string;
}

// Attachment DTOs
export interface AttachmentDto {
  id: number;
  imgPath?: string;
  masterType?: number;
  masterId?: number;
  attachmentTitle?: string;
  attConfigID?: number;
  lastModified?: Date;
}

export interface AttachmentBase64Dto {
  fileBase64: string;
  fileName: string;
  masterId: number;
  attConfigID: number;
}
