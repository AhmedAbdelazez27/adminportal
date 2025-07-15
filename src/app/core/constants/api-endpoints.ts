export class ApiEndpoints {
  static readonly User = {
    Base: '/User',
    GetAll: '/GetAll',
    GetById: (id: string) => `/User/${id}`,
    Delete: (id: string) => `/User/Delete/${id}`,
    GetUsersSelect2List: '/User/GetUsersSelect2List'
  };

  static readonly Roles = {
    Base: '/Roles',
    GetPaginated: '/Roles',
    GetById: (id: string) => `/${id}`,
    Delete: (id: string) => `/Delete/${id}`,
    Unassign: '/UnAssignRole',
    GetRoleUsers: (roleId: string) => `/GetRoleUsers/${roleId}`,
    GetRolesSelect2List: '/GetRolesSelect2List',
    Assign: '/AssignRole',
    GetScreensList: '/GetScreensList',
    AssignScreenPermission: '/AssignScreenPermission',

  };

  static readonly Departments = {
    Base: '/Department',
    Select2: '/Select2'
  };

  static readonly UsersDepartments = {
    Base: '/UsersDepartments',
    Assign: '/Assign'
  };

  static readonly UsersEntities = {
    Base: '/UsersEntities',
    GetUsersEntitiesSelect2List: '/GetAll',
    AssignUserEntities: '/AssignUserEntities',
    AssignRoleEntities: '/AssignRoleEntities',
  };

  static readonly Entity = {
    Base: '/Entity'
  };

}

