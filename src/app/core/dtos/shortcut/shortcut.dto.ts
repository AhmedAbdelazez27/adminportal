export interface ShortcutDto {
  id: number;
  pageName: string;
  displayName?: string;
  userId: string;
  isSelected: boolean;
  user?: AppUserDto;
}

export interface CreateShortcutDto {
  pageName: string;
}

export interface AppUserDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}
