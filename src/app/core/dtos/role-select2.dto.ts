export interface RoleSelect2RequestDto {
  searchValue?: string | null;
  skip: number;
  take: number;
  orderByValue?: string | null;
}