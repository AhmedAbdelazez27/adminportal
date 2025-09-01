import { Injectable } from '@angular/core';

export interface RouteMapping {
  path: string;
  parentRoute?: string;
  tab?: string;
  queryParams?: { [key: string]: any };
  requiresAuth?: boolean;
  permission?: string;
}

export interface TabBasedRoute {
  parentPath: string;
  tabs: { [tabName: string]: string }; // tab name -> component identifier
  defaultTab?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedRouteMappingService {
  
  // Comprehensive route mapping for all pageNames from backend
  private readonly routeMapping: { [pageName: string]: RouteMapping } = {
    // Financial Operations
    'ApMiscPaymentHeader': { path: '/financial/operations/payment-voucher', permission: 'ApMiscPaymentHeader' },
    'GlJeHeader': { path: '/financial/operations/general-journal', permission: 'GlJeHeader' },
    'ArMiscReciptHeader': { path: '/financial/operations/receipt-voucher', permission: 'ArMiscReciptHeader' },
    'ApPaymentTransactionsHdr': { path: '/financial/operations/receipt-operations', permission: 'ApPaymentTransactionsHdr' },
    'VwApInvoiceHd': { path: '/financial/operations/invoice', permission: 'VwApInvoiceHd' },
    'ApVendor': { path: '/financial/operations/vendor', permission: 'ApVendor' },
    'GlAccount': { path: '/financial/operations/gl-account', permission: 'GlAccount' },
    'GlAccountEntity': { path: '/financial/operations/gl-account-entity', permission: 'GlAccountEntity' },
    
    // Financial Reports
    'GeneralGlJournalRpt': { path: '/financial/reports/general-gl-journal', permission: 'GeneralGlJournalRpt' },
    'ReceiptRpt': { path: '/financial/reports/receipt', permission: 'ReceiptRpt' },
    'CatchReceiptRpt': { path: '/financial/reports/catch-receipt', permission: 'CatchReceiptRpt' },
    'VendorsPayRpt': { path: '/financial/reports/vendors-pay', permission: 'VendorsPayRpt' },
    'BalanceReviewRpt': { path: '/financial/reports/balance-review', permission: 'BalanceReviewRpt' },
    
    // Financial Charts
    'RevenueAndExpensesCharts': { path: '/financial/charts/revenue-expenses/General', permission: 'RevenueAndExpensesCharts' },
    'ReceiptsAndPaymentsCharts': { path: '/financial/charts/receipt-payment/General', permission: 'ReceiptsAndPaymentsCharts' },
    'RevenueComparisonCharts': { path: '/financial/charts/comparisons-revenue-expenses/revenueByEntity', permission: 'RevenueComparisonCharts' },
    'ExpensesComparisonCharts': { path: '/financial/charts/comparisons-revenue-expenses/expensesByEntity', permission: 'ExpensesComparisonCharts' },
    'PaymentsComparisonCharts': { path: '/financial/charts/receipts-payments-comparission/paymentsByEntity', permission: 'PaymentsComparisonCharts' },
    'ReceiptsComparisonCharts': { path: '/financial/charts/receipts-payments-comparission/receiptsByEntity', permission: 'ReceiptsComparisonCharts' },
    'GuaranteesComparisonChartTypeChart': { path: '/financial/charts/guarantees-comparison', permission: 'GuaranteesComparisonChartTypeChart' },
    
    // Social Cases Operations
    'AidRequest': { path: '/SocialCases/operations/AidRequests', permission: 'AidRequest' },
    'SpCases': { path: '/SocialCases/operations/cases', permission: 'SpCases' },
    'SpBeneficents': { path: '/SocialCases/operations/beneficiaries', permission: 'SpBeneficents' },
    'SpContracts': { path: '/SocialCases/operations/contracts', permission: 'SpContracts' },
    'SpContractCases': { path: '/SocialCases/operations/contract-cases', permission: 'SpContractCases' },
    'SpCasesPaymentHdr': { path: '/SocialCases/operations/cases-payments', permission: 'SpCasesPaymentHdr' },
    'SpCasesHistory': { path: '/SocialCases/operations/cases-history', permission: 'SpCasesHistory' },
    
    // Social Cases Reports
    'BeneficentsRpt': { path: '/SocialCases/reports/beneficiaries', permission: 'BeneficentsRpt' },
    'BenifcientTotalRpt': { path: '/SocialCases/reports/beneficiary-total', permission: 'BenifcientTotalRpt' },
    'CaseSearchRpt': { path: '/SocialCases/reports/case-search', permission: 'CaseSearchRpt' },
    'CaseSearchListRpt': { path: '/SocialCases/reports/case-search-list', permission: 'CaseSearchListRpt' },
    'CasesEntitiesRpt': { path: '/SocialCases/reports/CasesEntities', permission: 'CasesEntitiesRpt' },
    'CaseAidEntitiesRpt': { path: '/SocialCases/reports/CasesHelp', permission: 'CaseAidEntitiesRpt' },
    'OrdersListRpt': { path: '/SocialCases/reports/BranchOrdersList', permission: 'OrdersListRpt' },
    'TotalBenDonationsRpt': { path: '/SocialCases/reports/total-ben-donations', permission: 'TotalBenDonationsRpt' },
    
    // Social Cases Charts
    'CasesAvailableForSponsorshipChart': { path: '/SocialCases/charts/cases-available-sponsorship', permission: 'CasesAvailableForSponsorshipChart' },
    'CasesNumberChart': { path: '/SocialCases/charts/cases-number', permission: 'CasesNumberChart' },
    'CasesNumberByNationalityAndSponsorShipChart': { path: '/SocialCases/charts/cases-number-nationality-sponsorship', permission: 'CasesNumberByNationalityAndSponsorShipChart' },
    'CasesNumberByPeriodAndSponsorShipChart': { path: '/SocialCases/charts/cases-number-period-sponsorship', permission: 'CasesNumberByPeriodAndSponsorShipChart' },
    'CasesNumberByAssociationOfficeAndSponsorShipChart': { path: '/SocialCases/charts/cases-number-association-sponsorship', permission: 'CasesNumberByAssociationOfficeAndSponsorShipChart' },
    'CasesNumberInOutCountryChart': { path: '/SocialCases/charts/cases-number-in-out-country', permission: 'CasesNumberInOutCountryChart' },
    'TotalAidChart': { path: '/SocialCases/charts/total-aid', permission: 'TotalAidChart' },
    'TotalAidByEmirateChart': { path: '/SocialCases/charts/total-aid-emirate', permission: 'TotalAidByEmirateChart' },
    'TotalCasesChart': { path: '/SocialCases/charts/total-cases', permission: 'TotalCasesChart' },
    'TotalCasesByBranchChart': { path: '/SocialCases/charts/total-cases-branch', permission: 'TotalCasesByBranchChart' },
    'TotalCasesByCityChart': { path: '/SocialCases/charts/total-cases-city', permission: 'TotalCasesByCityChart' },
    'TotalCasesByNationalityChart': { path: '/SocialCases/charts/total-cases-nationality', permission: 'TotalCasesByNationalityChart' },
    'TotalCasesSummaryChart': { path: '/SocialCases/charts/total-cases-summary', permission: 'TotalCasesSummaryChart' },
    'TotalDonationsBySponsorShipChart': { path: '/SocialCases/charts/total-donations-sponsorship', permission: 'TotalDonationsBySponsorShipChart' },
    'TotalRequestsChart': { path: '/SocialCases/charts/total-requests', permission: 'TotalRequestsChart' },
    'TotalRequestsByBranchChart': { path: '/SocialCases/charts/total-requests-branch', permission: 'TotalRequestsByBranchChart' },
    'TotalRequestsByCityChart': { path: '/SocialCases/charts/total-requests-city', permission: 'TotalRequestsByCityChart' },
    'TotalRequestsByNationalityChart': { path: '/SocialCases/charts/total-requests-nationality', permission: 'TotalRequestsByNationalityChart' },
    
    // Sponsorship Operations
    'SpCasesPayment': { path: '/Sponsorship/operations/cases-payment', permission: 'SpCasesPayment' },
    'ContractSummaryByPaymentMethodChart': { path: '/Sponsorship/charts/contract-summary-payment-method', permission: 'ContractSummaryByPaymentMethodChart' },
    
    // Projects Operations
    'ProjectsHdr': { path: '/Projects/operations/projects', permission: 'ProjectsHdr' },
    'CpProjectImplement': { path: '/Projects/operations/project-implement', permission: 'CpProjectImplement' },
    'ScProject': { path: '/Projects/operations/sc-project', permission: 'ScProject' },
    
    // Projects Charts
    'ProjectReceiptsChart': { path: '/Projects/charts/project-receipts', permission: 'ProjectReceiptsChart' },
    'ProjectsCostChart': { path: '/Projects/charts/projects-cost', permission: 'ProjectsCostChart' },
    'ProjectsSummaryChart': { path: '/Projects/charts/projects-summary', permission: 'ProjectsSummaryChart' },
    
    // Service Requests Reports
    'ServiceRequestsDetailsRpt': { path: '/ServiceRequests/reports/service-requests-details', permission: 'ServiceRequestsDetailsRpt' },
    
    // Authentication
    'Role': { path: '/authentication/roles', permission: 'Role.View' },
    'User': { path: '/authentication/users', permission: 'User.View' },
    'Departments': { path: '/authentication/department', permission: 'Departments.View' },
    'Entity': { path: '/authentication/entity', permission: 'Entity.View' },
    'Permission': { path: '/authentication/roles', permission: 'Role.View' },
    'UsersEntities': { path: '/authentication/users', permission: 'User.View' },
    'UsersDepartments': { path: '/authentication/users', permission: 'User.View' },
    
    // Services
    'Services': { path: '/serviceSetting2', permission: 'ServiceSetting.View' },
    'MainApplyRequestService': { path: '/mainServices', permission: 'MainApplyRequestService.View' },
    
    // Settings with Tabs - These components are displayed as tabs within parent routes
    'Region': { path: '/settings/regions', tab: 'regions', permission: 'Settings.View' },
    'Location': { path: '/settings/regions', tab: 'locations', permission: 'Settings.View' },
    'AvailableNumber': { path: '/settings/regions', tab: 'other', permission: 'Settings.View' },
    'ContactInformation': { path: '/settings/contact-information', permission: 'Settings.View' },
    'Attachment': { path: '/settings/regions', tab: 'attachments-config', permission: 'Settings.View' },
    'AttachmentConfig': { path: '/settings/regions', tab: 'attachments-config', permission: 'Settings.View' },
    'Initiative': { path: '/settings/regions', tab: 'initiatives', permission: 'Settings.View' },
    'HeroSectionSetting': { path: '/settings/regions', tab: 'hero-section-setting', permission: 'Settings.View' },
    
    // Data Management
    'DataTransLogs': { path: '/system/data-trans-logs', permission: 'DataTransLogs.View' },
    'Partner': { path: '/system/partner', permission: 'Partner.View' },
    
    // Event Permits
    'RequestEventPermits': { path: '/events/request-permits', permission: 'RequestEventPermits.View' },
    
    // Additional Settings Components (Polls is handled in settings/regions as a tab)
    'Polls': { path: '/settings/regions', tab: 'polls', permission: 'Settings.View' },
    
    // Note: Many pageNames from backend don't have direct components but are handled 
    // through parent routes with tabs or different routing structures.
    // These are mapped to their closest equivalent or parent route.
    
    // Fallback mappings for backend pageNames that don't have direct routes
    'Permits': { path: '/system/permits', permission: 'Permits.View' }
  };

  // Tab-based routes configuration
  private readonly tabBasedRoutes: { [parentPath: string]: TabBasedRoute } = {
    '/settings/regions': {
      parentPath: '/settings/regions',
      defaultTab: 'regions',
      tabs: {
        'regions': 'Region',
        'locations': 'Location', 
        'other': 'AvailableNumber',
        'contact-information': 'ContactInformation',
        'attachments-config': 'Attachment',
        'initiatives': 'Initiative',
        'polls': 'Polls',
        'hero-section-setting': 'HeroSectionSetting'
      }
    }
  };

  constructor() { }

  /**
   * Get route mapping for a given pageName
   */
  getRouteMapping(pageName: string): RouteMapping | null {
    return this.routeMapping[pageName] || null;
  }

  /**
   * Get complete navigation path with query parameters for tab-based routes
   */
  getNavigationPath(pageName: string): { path: string; queryParams?: any } | null {
    const mapping = this.getRouteMapping(pageName);
    if (!mapping) {
      return null;
    }

    const result: { path: string; queryParams?: any } = {
      path: mapping.path
    };

    // If this route has a tab, add it as a query parameter
    if (mapping.tab) {
      result.queryParams = { tab: mapping.tab };
    }

    // Add any additional query parameters
    if (mapping.queryParams) {
      result.queryParams = { ...result.queryParams, ...mapping.queryParams };
    }

    return result;
  }

  /**
   * Check if a route is tab-based
   */
  isTabBasedRoute(path: string): boolean {
    return !!this.tabBasedRoutes[path];
  }

  /**
   * Get tab configuration for a parent route
   */
  getTabConfiguration(parentPath: string): TabBasedRoute | null {
    return this.tabBasedRoutes[parentPath] || null;
  }

  /**
   * Get all available pageNames
   */
  getAllPageNames(): string[] {
    return Object.keys(this.routeMapping);
  }

  /**
   * Get tab name for a pageName
   */
  getTabForPageName(pageName: string): string | null {
    const mapping = this.getRouteMapping(pageName);
    return mapping?.tab || null;
  }

  /**
   * Get parent path for a pageName
   */
  getParentPathForPageName(pageName: string): string | null {
    const mapping = this.getRouteMapping(pageName);
    return mapping?.parentRoute || mapping?.path || null;
  }

  /**
   * Find pageName by path and tab
   */
  findPageNameByPathAndTab(path: string, tab?: string): string | null {
    for (const [pageName, mapping] of Object.entries(this.routeMapping)) {
      if (mapping.path === path) {
        if (tab && mapping.tab === tab) {
          return pageName;
        } else if (!tab && !mapping.tab) {
          return pageName;
        }
      }
    }
    return null;
  }

  /**
   * Get all pageNames for a specific parent route
   */
  getPageNamesForParentRoute(parentPath: string): string[] {
    const result: string[] = [];
    for (const [pageName, mapping] of Object.entries(this.routeMapping)) {
      if (mapping.path === parentPath) {
        result.push(pageName);
      }
    }
    return result;
  }

  /**
   * Validate if a navigation is valid
   */
  isValidNavigation(pageName: string): boolean {
    return !!this.getRouteMapping(pageName);
  }

  /**
   * Get fallback route for unknown pageNames
   */
  getFallbackRoute(pageName: string): string {
    // Try to match partial names or return home
    const lowerPageName = pageName.toLowerCase();
    
    // Check for partial matches
    for (const [key, mapping] of Object.entries(this.routeMapping)) {
      if (key.toLowerCase().includes(lowerPageName) || lowerPageName.includes(key.toLowerCase())) {
        return mapping.path;
      }
    }
    
    // Return home as ultimate fallback
    return '/home';
  }
}
