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
    UpdateUserStatus : '/UpdateUserStatus'

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
    Create: '/Create',
    Update: '/Update',
    Get: (id: number) => `/Get/${id}`,
    GetAll: '/GetAll',
    Delete: (id: number) => `/Delete/${id}`,
    Select2: '/Select2',
  };

  static readonly UsersDepartments = {
    Base: '/UsersDepartments',
    Assign: '/Assign',
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
     GetAll: '/Entity/GetAll',
    GetById: (id: string) => `/Entity/${id}`,
  };

    static readonly EntityInfo = {
    Base: '/Lookup/EntityInfo'
  };
  static readonly UserStatus = {
    Base: '/Lookup/UserStatus'
  };


  static readonly ApMiscPaymentHeader = {
    Base: '/ApMiscPaymentHeader',
    GetAll: '/GetAll',
    GetById: (paymentId: string, entityId: string) => `/GetDetailById/${paymentId}/${entityId}`,
    GetPaymentDetailsById: (paymentId: string, entityId: string) => `/GetPaymentDetails/${paymentId}/${entityId}`,
    GetPaymentLinesById: (paymentId: string, entityId: string) => `/GetPaymentLines/${paymentId}/${entityId}`,
  };

  static readonly ArMiscReceiptHeader = {
    Base: '/ArMiscReciptHeader',
    GetAll: '/GetAll',
    GetById: (miscReceiptId: string, entityId: string) => `/GetReceiptHeader/${miscReceiptId}/${entityId}`,
    GetReceiptDetailsById: (miscReceiptId: string, entityId: string) => `/GetReceiptDetails/${miscReceiptId}/${entityId}`,
    GetReceiptLinesById: (miscReceiptId: string, entityId: string) => `/GetReceiptLines/${miscReceiptId}/${entityId}`,
  };

  static readonly ApMiscPaymentTransactionHDR = {
    Base: '/ApPaymentTransactionsHdr',
    GetAll: '/GetAll',
    GetById: (paymentId: string, entityId: string) => `/Get/${paymentId}/${entityId}`,
  };

  static readonly ApVendor = {
    Base: '/ApVendor',
    GetAll: '/GetAll',
    GetById: (vendorId: string, entityId: string) => `/Get/${vendorId}/${entityId}`,
  };

  static readonly GlJeHeader = {
    Base: '/GlJeHeader',
    GetAll: '/GetAll',
    GetById: (receiptId: string, entityId: string) => `/GetGeneralJournalHeaderDetails/${receiptId}/${entityId}`,
    GetLineDetailsById: (receiptId: string, entityId: string) => `/GetGLLines/${receiptId}/${entityId}`,
  };

  static readonly InvoiceHd = {
    Base: '/VwApInvoiceHd',
    GetAll: '/GetAll',
    GetDetailById: (tr_Id: string, entityId: string) => `/GetInvoiceheaderDetails/${tr_Id}/${entityId}`,
    GetById: '/GetInvoiceheaderDetails',
    GetTrDetailsById: '/GetInvoiceTr',
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
