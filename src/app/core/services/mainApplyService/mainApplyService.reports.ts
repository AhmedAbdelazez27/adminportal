import { Component, Injectable, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { FiltermainApplyServiceDto, FiltermainApplyServiceByIdDto, mainApplyServiceDto, AppUserDto, AttachmentDto, RequestAdvertisementTargetDto, RequestAdvertisementAdLocationDto, RequestAdvertisementAdMethodDto, RequestPlaintEvidenceDto, RequestPlaintJustificationDto, RequestPlaintReasonDto, WorkFlowCommentDto, UpdateStatusDto, DonationCollectionChannelDto, printResultDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { SpinnerService } from '../../../core/services/spinner.service';
import { Select2Service } from '../../../core/services/Select2.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { ServiceDataType, ServicesType, serviceIdEnum } from '../../../core/enum/user-type.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityService } from '../../../core/services/entit.service';
import { AttachmentGalleryComponent } from '../../../../shared/attachment-gallery/attachment-gallery.component';
import { environment } from '../../../../environments/environment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeComponent } from 'angularx-qrcode';
import QRCode from 'qrcode';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class MainApplyServiceReportService {

  showReport: boolean = false;
  id: string | null = null;
  qrCodeBase64: string | null = null;
  qrCodeUrl: string | null = null;
  reportHeader: string | null = null;
  reportFooter: string | null = null;
  reportHeaderIcon: string | null = null;
  currecntDept: string | null = null;
  private destroy$ = new Subject<void>();
  reportData: mainApplyServiceDto = {} as mainApplyServiceDto;
  reportWindow = window.open('', '_blank');
  constructor(
    private mainApplyService: MainApplyService,
    private translate: TranslateService,
    private spinnerService: SpinnerService,
  ) { }


  async printDatabyId(id: string, serviceId: number, status: string): Promise<void> {
    this.spinnerService.show();

    const params: FiltermainApplyServiceByIdDto = { id };
    const qrUrl = `${environment.apiBaseUrl}login/PrintD?no=${id}&status=${status}`;

    try {
      // Generate QR with fallback
      this.qrCodeBase64 = await this.generateQRCodeWithRetry(qrUrl, 2, 3000);
    } catch {
      console.warn('QR generation failed, using fallback QR');
      this.qrCodeBase64 = await QRCode.toDataURL('Fallback QR', { width: 120 });
    }

    forkJoin({
      mischeaderdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          try {
            const reportDatas = Array.isArray(result.mischeaderdata)
              ? result.mischeaderdata[0] ?? ({} as mainApplyServiceDto)
              : result.mischeaderdata;

            const baseUrl = window.location.origin;
            this.reportHeader = `${baseUrl}/assets/images/council-logo.png`;
            this.reportFooter = `${baseUrl}/assets/images/reportFooter.png`;
            this.reportHeaderIcon = `${baseUrl}/assets/images/reportHeaderIcon.png`;
            this.reportData = reportDatas;

            // Open new window for report
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
              alert('Please allow pop-ups for this site.');
              return;
            }

            // ✅ Strict A4 styling
            // ✅ Strict one-page A4 style
            const a4Style = `
<style>
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
    html {
       overflow: auto !important;
       }
  html, body {
    margin: 0;
    padding: 0;
    width: 190mm !important;
    height: 277mm !important;
    background: #fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    overflow: hidden;
        display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f2f2f2; /* light gray background outside A4 */
}

  .a4-page {
    box-sizing: border-box;
    width: 190mm; /* inner width after margin */
    height: 277mm; /* inner height after margin */
    margin: 0 auto;
    padding: 2mm;
    background: #fff;
    border: 1px solid #ddd;
    position: relative;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  td, th {
    border: 1px solid #ccc;
    padding: 5px;
    vertical-align: top;
    word-break: break-word;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 5px;
    color: #fff;
    font-weight: bold;
  }

  /* ✅ Toolbar for download button */
  .toolbar {
    text-align: right;
    background: #f8f9fa;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    position: sticky;
    top: 0;
  }

  .btn-download {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .btn-download:hover {
    background: #0056b3;
  }

  @media print {
    html, body {
      overflow: hidden !important;
    }
    .toolbar { display: none !important; }
    .a4-page {
      box-shadow: none !important;
      border: none !important;
      width: 190mm !important;
      height: 277mm !important;
    }
  }
</style>`;


            let reportHtml = '';
            console.log("serviceId", serviceId);

            if (serviceId === ServicesType.TentPermission) {
              if (status === 'final') {
                reportHtml = this.buildFinalFastingTentServiceReport();
              } else {
                reportHtml = this.buildInitialFastingTentServiceReport();
              }
            }
            else if (serviceId === ServicesType.TentPermission) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.CharityEventPermit) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.RequestForStaffAppointment) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.ReligiousInstitutionRequest) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.RequestAnEventAnnouncement) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.DonationCampaignPermitRequest) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.GrievanceRequest) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.DistributionSitePermitApplication) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else if (serviceId === ServicesType.RequestComplaint) {
              reportHtml = this.buildInitialFastingTentServiceReport();
            }
            else {
              reportHtml = `<p>No report template available for this service.</p>`;
            }

            printWindow.document.open();
            printWindow.document.write(`
            <html><head><title>${this.translate.instant('mainApplyServiceResourceName.report.fastingTentPermit')}</title>${a4Style}</head>

            <body>
            <div class="a4-page" id="reportContent">
            ${reportHtml}
            </div>
            <script>
            document.getElementById('btnDownloadPDF').addEventListener('click', function() {
              window.print();
              });
              </script>
              </body>
              </html>
              `);
            printWindow.document.close();


          } catch (error) {
            console.error('Error showing report:', error);
          } finally {
            this.spinnerService.hide();
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.spinnerService.hide();
        },
      });
  }


  private async generateQRCodeWithRetry(url: string, retries: number, timeout: number): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const qrPromise = QRCode.toDataURL(url, {
          errorCorrectionLevel: 'M',
          width: 120,
        });

        const result = await Promise.race<string>([
          qrPromise as Promise<string>,
          new Promise<string>((_, reject) => setTimeout(() => reject('timeout'), timeout)),
        ]);

        return result;
      } catch (error) {
        console.warn(`QR generation attempt ${attempt + 1} failed:`, error);
        if (attempt === retries) throw error;
      }
    }
    throw new Error('QR generation failed after retries');
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }



  private buildInitialFastingTentServiceReport(): string {
    return `
   <div id="report">
    <!-- Header -->
    <div style="width: 100%; text-align: center;">
      <img src="${this.reportHeader}" alt="Header" style="width: 90%; height: auto;">
    </div>

    <!-- QR Code -->
    <div style="width: 90%; text-align: left; padding: 10px 30px;">
      <img src="${this.qrCodeBase64}" alt="QR Code" style="width: 100px; height: 100px;">
    </div>

    <div style="padding: 10px 50px 10px 50px;">

      <!-- Application Info -->
      <table>
        <tr>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestDate')} :
            <span style="color:black;">${this.formatDate(this.reportData?.applyDate ?? null)}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitType')}</td>
        </tr>
      </table>

     <div style="padding: 10px; text-align: left;">
  <span style="background:#d8b45b;color:#fff;padding:3px 10px;border-radius:5px;font-weight:bold;">
    ${this.translate.instant('mainApplyServiceResourceName.report.fieldPermit')}
  </span>
</div>

      <div style="text-align:center;background:#f5f5f5;border:1px solid #ccc;padding:6px;font-weight:bold;font-size:15px;margin-top:5px;">
        ${this.translate.instant('mainApplyServiceResourceName.report.fastingTentPermit')}
      </div>

      <!-- Foundation Info -->
      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationName')} : </strong>
          <span style="color:black;">${this.reportData?.user?.foundationName ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationAddress')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.address ?? ''}</span></td>
        </tr>
      </table>

      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitType')} : </strong>
          <span style="color:black;">${this.reportData?.requestEventPermit?.lkpRequestTypeName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.contactNumber')} : </strong>
          <span style="color:black;">${this.reportData?.user?.telNumber ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitEnd')} : </strong>
          <span style="color:black;">${this.formatDate(this.reportData?.fastingTentService?.endDate ?? null)}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitStart')} : </strong>
          <span style="color:black;">${this.formatDate(this.reportData?.fastingTentService?.startDate ?? null)}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.region')}: </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.regionName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.streetName')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span></td>
        </tr>
      </table>

      <div style="border:1px solid #ccc;border-top:none;padding:6px;font-size:13px;">
        <strong>${this.translate.instant('mainApplyServiceResourceName.report.locationDetails')} : </strong>
        <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span>
      </div>

      <p style="color:red;font-weight:bold;font-size:12px;margin-top:10px;">
        *${this.translate.instant('mainApplyServiceResourceName.report.noteInsideTent')}
      </p>

      <!-- Rules -->
      <h4>${this.translate.instant('mainApplyServiceResourceName.report.ruleTitle')}</h4>
      <ol style="font-size:13px;line-height:1.6;padding-right:20px;color:#333;">
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule1')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule2')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule3')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule4')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule5')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule6')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule7')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule8')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule9')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule10')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule11')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule12')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule13')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule14')}</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style="width:100%;">
      <img src="${this.reportFooter}" alt="Footer" style="width:100%;height:auto;">
    </div>
  </div>
  `;
  }


  private buildFinalFastingTentServiceReport(): string {
    return `
   <div id="report">
    <!-- Header -->
    <div style="width: 100%; text-align: center;">
      <img src="${this.reportHeader}" alt="Header" style="width: 90%; height: auto;">
    </div>

    <!-- QR Code -->
    <div style="width: 90%; text-align: left; padding: 10px 30px;">
      <img src="${this.qrCodeBase64}" alt="QR Code" style="width: 100px; height: 100px;">
    </div>

    <div style="padding: 10px 50px 10px 50px;">

      <!-- Application Info -->
      <table>
        <tr>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestDate')} :
            <span style="color:black;">${this.formatDate(this.reportData?.applyDate ?? null)}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitType')}</td>
        </tr>
      </table>

      <div style="padding: 10px; text-align: left;">
  <span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:5px;font-weight:bold;">
    ${this.translate.instant('mainApplyServiceResourceName.report.finalPermit')}
  </span>
</div>


      <div style="text-align:center;background:#f5f5f5;border:1px solid #ccc;padding:6px;font-weight:bold;font-size:15px;margin-top:5px;">
        ${this.translate.instant('mainApplyServiceResourceName.report.fastingTentPermit')}
      </div>

      <!-- Foundation Info -->
      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationName')} : </strong>
          <span style="color:black;">${this.reportData?.user?.foundationName ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationAddress')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.address ?? ''}</span></td>
        </tr>
      </table>

      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitType')} : </strong>
          <span style="color:black;">${this.reportData?.requestEventPermit?.lkpRequestTypeName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.contactNumber')} : </strong>
          <span style="color:black;">${this.reportData?.user?.telNumber ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitEnd')} : </strong>
          <span style="color:black;">${this.formatDate(this.reportData?.fastingTentService?.endDate ?? null)}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitStart')} : </strong>
          <span style="color:black;">${this.formatDate(this.reportData?.fastingTentService?.startDate ?? null)}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.region')}: </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.regionName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.streetName')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span></td>
        </tr>
      </table>

      <div style="border:1px solid #ccc;border-top:none;padding:6px;font-size:13px;">
        <strong>${this.translate.instant('mainApplyServiceResourceName.report.locationDetails')} : </strong>
        <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span>
      </div>

      <p style="color:red;font-weight:bold;font-size:12px;margin-top:10px;">
        *${this.translate.instant('mainApplyServiceResourceName.report.noteInsideTent')}
      </p>

      <!-- Rules -->
      <h4>${this.translate.instant('mainApplyServiceResourceName.report.ruleTitle')}</h4>
      <ol style="font-size:13px;line-height:1.6;padding-right:20px;color:#333;">
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule1')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule2')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule3')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule4')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule5')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule6')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule7')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule8')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule9')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule10')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule11')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule12')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule13')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule14')}</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style="width:100%;">
      <img src="${this.reportFooter}" alt="Footer" style="width:100%;height:auto;">
    </div>
  </div>
  `;
  }
} 
