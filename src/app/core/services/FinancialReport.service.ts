import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FndLookUpValuesSelect2RequestDto, PagedResult, SelectdropdownResult } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { catchReceiptRptInputDto, generalLJournalRptInputDto, getTotlaBenDonationsRPTInputDto, receiptRPTInputDto, vendorsPayTransRPTInputDto } from '../dtos/Reports/FinancialReportsInput.dto';
import { catchReceiptRptOutputDto, generalLJournalRptOutputDto, getTotlaBenDonationsRPTOutputDto, receiptRPTOutputDto, vendorsPayTransRPTOutputDto } from '../dtos/Reports/FinancialReportsOutput.dto';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class FinancialReportService {
  constructor(private http: HttpClient) { }

  getEntitySelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Entity/GetSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getCollectorSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/ApMiscPaymentHeader/GetCollectorsSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getCategorySelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Lookup/ReceiptIdentifier`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getCountrySelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/FndCountry/GetSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getBranchSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetBranchSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getDeptSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/Department/Select2`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getAccountSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/GlAccount/GetGlAccountSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getBeneficentIdSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/SpBeneficents/GetSpBeneficentsSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getGlPeriodSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/GlPeriodDetails/GetGlPeriodDetailSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getVendorSelect2(params: FndLookUpValuesSelect2RequestDto): Observable<SelectdropdownResult> {
    const apiUrl = `${environment.apiBaseUrl}/ApVendor/GetvendorSelect2List`;
    return this.http.post<SelectdropdownResult>(apiUrl, params);
  }

  getcatchReceiptRptData(params: catchReceiptRptInputDto): Observable<PagedResult<catchReceiptRptOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetCachReceiptRpt`;
    return this.http.post<PagedResult<catchReceiptRptOutputDto[]>>(apiUrl, params);
  }

  getgeneralLJournalRptData(params: generalLJournalRptInputDto): Observable<PagedResult<generalLJournalRptOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetGeneralLJournalRpt`;
    return this.http.post<PagedResult<generalLJournalRptOutputDto[]>>(apiUrl, params);
  }

  getreceiptRPTData(params: receiptRPTInputDto): Observable<PagedResult<receiptRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetReceiptRpt`;
    return this.http.post<PagedResult<receiptRPTOutputDto[]>>(apiUrl, params);
  }

  getvendorsPayTransRPTData(params: vendorsPayTransRPTInputDto): Observable<PagedResult<vendorsPayTransRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetVendorsPayRpt`;
    return this.http.post<PagedResult<vendorsPayTransRPTOutputDto[]>>(apiUrl, params);
  }

  getgetTotlaBenDonationsRPTData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetTotalBenDonationsRpt`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getupdateGlAccountSelection(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetTotalBenDonationsRpt`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getgetgltrialbalancesRPTData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetGlTrialBalancesRpt`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getgetGeneralBalanceSheetRptData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetGeneralBalanceSheetRpt`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getgetGeneralProLosRPTData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${environment.apiBaseUrl}/FinancialReports/GetGeneralProLosRpt`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }
}
