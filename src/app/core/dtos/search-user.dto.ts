export class FilterUserDto {
  name: string | null = null;
  idNumber: string | null = null;
  foundationName: string | null = null;
  licenseNumber: string | null = null;
  entityInfoId: string | null = null;
  entityId: string | null = null;
  userType: number | null = null;
  userStatus: number | null = null;
  applyDate: Date | null = null;
  searchValue: string | null = null;
  skip: number = 1;
  take: number = 10;
  orderByValue: string | null = null;
}
