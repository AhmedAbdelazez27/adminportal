export class ApiEndpoints {
  static readonly User = {
    Base: '/User',
    GetAll: '/GetAll',
    GetById: (id: string) => `/User/${id}`,
    Delete: (id: string) => `/User/Delete/${id}`,
    GetUsersSelect2List: '/User/GetUsersSelect2List',
    GetUserPermissionList: (id: string) => `/Permission/GetAll/${id}`,
    AssignActionPermission: '/Permission/CreateUserPermission',
    DeleteActionPermission: '/Permission/DeleteUserPermission',
    UserType: '/UserTypes',
    ChangePassword: '/ChangePassword',
    ForgotPassword : '/ForgotPassword ',
    verifyOtp : '/Otp/Verify',
    OtpSendViaEmail : '/Otp/SendViaEmail',
    ResetPassword : '/ResetPassword',

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
    unAssign: '/UnAssignRole',
    GetScreensList: '/GetScreensList',
    AssignScreenPermission: '/AssignScreenPermission',
    GetUserOfRole: (id: string) => `/GetRoleUsers/${id}`,


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
    Base: '/Entity',
    GetSelect2List : '/GetSelect2List',
  };

    static readonly EntityInfo = {
    Base: '/Lookup/EntityInfo'
  };
  static readonly UserStatus = {
    Base: '/Lookup/UserStatus'
  };


  static readonly ArMiscReceiptHeader = {
    Base: '/ArMiscReciptHeader',
    GetAll: '/GetAll',
    GetById: (miscReceiptId: string, entityId: string) => `/Get/${miscReceiptId}/${entityId}`,
    GetReceiptDetailsById: (miscReceiptId: string, entityId: string) => `/Get/${miscReceiptId}/${entityId}`,
    GetReceiptLinesById: (miscReceiptId: string, entityId: string) => `/Get/${miscReceiptId}/${entityId}`,
  };


  static readonly ApMiscPaymentTransactionHDR = {
    Base: '/ApPaymentTransactionsHdr',
    GetAll: '/GetAll',
    GetDetailById: '/Get',
    GetById: (paymentId: string, entityId: string) => `/Get/${paymentId}/${entityId}`,
  };

  static readonly FinancialReports = {
    Base: '/FinancialReports',
    CachReceiptRptEndPoint: '/GetCachReceiptRpt',
    GetGeneralLJournalRptEndPoint: '/GetGeneralLJournalRpt',
    GetReceiptRptEndPoint: '/GetReceiptRpt',
    GetVendorsPayRptEndPoint: '/GetVendorsPayRpt',
    GetGeneralProLosRptEndPoint: '/GetGeneralProLosRpt',
    GetTotalBenDonationsRptEndPoint: '/GetTotalBenDonationsRpt',
    GetGetGlTrialBalancesRptEndPoint: '/GetGlTrialBalancesRpt',
    GetGeneralBalanceSheetRptEndPoint: '/GetGeneralBalanceSheetRpt',
  }
  static readonly beneficent = {
    Base: '/SpBeneficents',
    GetAll: '/GetAll',
    GetDetailById: '/Get',
    GetById: (beneficentId: string, entityId: string) => `/GetCasesSearch/${beneficentId}/${entityId}`,
  };

}

