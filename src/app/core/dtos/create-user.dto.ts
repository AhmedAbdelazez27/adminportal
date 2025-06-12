export interface CreateUserDto {
  userName: string;
  password: string;
  phoneNumber: string;
  roles: string[];
}

export interface UpdateUserDto {
  id: string;
  userName: string;
  phoneNumber: string;
  roles: string[];
}