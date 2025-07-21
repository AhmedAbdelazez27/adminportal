import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FndLookUpValuesSelect2RequestDto, PagedResult, SelectdropdownResult } from '../dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { catchReceiptRptInputDto, generalLJournalRptInputDto, getTotlaBenDonationsRPTInputDto, receiptRPTInputDto, vendorsPayTransRPTInputDto } from '../dtos/Reports/FinancialReportsInput.dto';
import { catchReceiptRptOutputDto, generalLJournalRptOutputDto, getTotlaBenDonationsRPTOutputDto, receiptRPTOutputDto, vendorsPayTransRPTOutputDto } from '../dtos/Reports/FinancialReportsOutput.dto';
import * as XLSX from 'xlsx';
import { ApiEndpoints } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class FinancialReportService {

  private readonly BASE_URL = `${environment.apiBaseUrl}${ApiEndpoints.FinancialReports.Base}`;
  constructor(private http: HttpClient) { }

  getcatchReceiptRptData(params: catchReceiptRptInputDto): Observable<PagedResult<catchReceiptRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.CachReceiptRptEndPoint}`;
    return this.http.post<PagedResult<catchReceiptRptOutputDto[]>>(apiUrl, params);
  }

  getgeneralLJournalRptData(params: generalLJournalRptInputDto): Observable<PagedResult<generalLJournalRptOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetGeneralLJournalRptEndPoint}`;
    return this.http.post<PagedResult<generalLJournalRptOutputDto[]>>(apiUrl, params);
  }

  getreceiptRPTData(params: receiptRPTInputDto): Observable<PagedResult<receiptRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetReceiptRptEndPoint}`;
    return this.http.post<PagedResult<receiptRPTOutputDto[]>>(apiUrl, params);
  }

  getvendorsPayTransRPTData(params: vendorsPayTransRPTInputDto): Observable<PagedResult<vendorsPayTransRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetVendorsPayRptEndPoint}`;
    return this.http.post<PagedResult<vendorsPayTransRPTOutputDto[]>>(apiUrl, params);
  }

  getgetTotlaBenDonationsRPTData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetTotalBenDonationsRptEndPoint}`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getupdateGlAccountSelection(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetTotalBenDonationsRptEndPoint}`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getgetgltrialbalancesRPTData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetGetGlTrialBalancesRptEndPoint}`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getgetGeneralBalanceSheetRptData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetGeneralBalanceSheetRptEndPoint}`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }

  getgetGeneralProLosRPTData(params: getTotlaBenDonationsRPTInputDto): Observable<PagedResult<getTotlaBenDonationsRPTOutputDto[]>> {
    const apiUrl = `${this.BASE_URL}${ApiEndpoints.FinancialReports.GetGeneralProLosRptEndPoint}`;
    return this.http.post<PagedResult<getTotlaBenDonationsRPTOutputDto[]>>(apiUrl, params);
  }
}
