import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-export-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="export-toolbar">
      <button type="button" class="btn" (click)="exportAsPdf()">
      <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
        <path d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19ZM12.28 15.78L10.28 17.78C10.21 17.85 10.12 17.91 10.03 17.94C9.94 17.98 9.85 18 9.75 18C9.65 18 9.56 17.98 9.47 17.94C9.39 17.91 9.31 17.85 9.25 17.79C9.24 17.78 9.23 17.78 9.23 17.77L7.23 15.77C6.94 15.48 6.94 15 7.23 14.71C7.52 14.42 8 14.42 8.29 14.71L9 15.44V11.25C9 10.84 9.34 10.5 9.75 10.5C10.16 10.5 10.5 10.84 10.5 11.25V15.44L11.22 14.72C11.51 14.43 11.99 14.43 12.28 14.72C12.57 15.01 12.57 15.49 12.28 15.78Z" fill="#8D734D"/>
        <path d="M17.4302 8.80999C18.3802 8.81999 19.7002 8.81999 20.8302 8.81999C21.4002 8.81999 21.7002 8.14999 21.3002 7.74999C19.8602 6.29999 17.2802 3.68999 15.8002 2.20999C15.3902 1.79999 14.6802 2.07999 14.6802 2.64999V6.13999C14.6802 7.59999 15.9202 8.80999 17.4302 8.80999Z" fill="#8D734D"/>
      </svg> 
       </button>
  
    </div>
  `
})
export class ExportToolbarComponent {
  @Input() targetElementId: string = 'exportArea';
  @Input() fileName: string = 'page';
  @Input() pdfOrientation: 'auto' | 'portrait' | 'landscape' = 'auto';
  @Input() pdfMarginMm: number = 10;
  @Input() captureFullPage: boolean = false; // if true, capture whole page; else capture target
  @Input() imageScale: number = 2; // dpi-like scale for clearer images

  private getTargetElement(): HTMLElement | null {
    return document.getElementById(this.targetElementId) ?? document.body;
  }

  private waitForReflow(ms = 120): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getDimensions(el: HTMLElement): { width: number; height: number } {
    const docEl = document.documentElement;
    const width = el === document.body || el === (document.documentElement as unknown as HTMLElement)
      ? Math.max(docEl.scrollWidth, document.body.scrollWidth)
      : el.scrollWidth;
    const height = el === document.body || el === (document.documentElement as unknown as HTMLElement)
      ? Math.max(docEl.scrollHeight, document.body.scrollHeight)
      : el.scrollHeight;
    return { width, height };
  }

  private async captureToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
    const { default: html2canvas } = await import('html2canvas');
    const { width, height } = this.getDimensions(el);
    return await html2canvas(el, {
      scale: this.imageScale,
      useCORS: true,
      allowTaint: false,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
      windowWidth: width,
      windowHeight: height,
      width,
      height
    } as any);
  }

  async exportAsPdf(): Promise<void> {
    const element = this.getTargetElement();
    if (!element) return;
    const jsPdfModule: any = await import('jspdf');
    await this.waitForReflow();
    
    // Capture the element directly to canvas at high resolution
    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = await this.captureToCanvas(element);
    } catch {}

    try {
      if (!canvas) throw new Error('capture failed');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Convert canvas size (px) to mm
      const pxToMm = (px: number) => px * 0.2645833333;
      const imgWmm = pxToMm(canvas.width);
      const imgHmm = pxToMm(canvas.height);
      const orientation = this.pdfOrientation === 'auto'
        ? (imgWmm > imgHmm ? 'l' : 'p')
        : (this.pdfOrientation === 'landscape' ? 'l' : 'p');

      // Fit image into A4 with margins
      const page = { w: orientation === 'l' ? 297 : 210, h: orientation === 'l' ? 210 : 297 };
      const margin = Math.max(0, this.pdfMarginMm);
      const contentW = Math.max(10, page.w - 2 * margin);
      const contentH = Math.max(10, page.h - 2 * margin);
      const scale = Math.min(contentW / imgWmm, contentH / imgHmm);
      const drawW = imgWmm * scale;
      const drawH = imgHmm * scale;
      const offsetX = margin + (contentW - drawW) / 2;
      const offsetY = margin + (contentH - drawH) / 2;

      const pdf = new jsPdfModule.jsPDF({ unit: 'mm', format: 'a4', orientation } as any);
      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawW, drawH);
      pdf.save(`${this.fileName}.pdf`);
    } catch {
      // As a last resort, open print dialog for the element
      try {
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(`<html><head><title>${this.fileName}</title></head><body>` + element.outerHTML + '</body></html>');
          w.document.close();
          w.focus();
          w.print();
        }
      } catch {}
    }
  }

  async exportAsPng(): Promise<void> {
    // Capture target section if present, else the full page
    const element = (this.captureFullPage ? document.documentElement : (this.getTargetElement() ?? document.body)) as HTMLElement;
    await this.waitForReflow();
    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = await this.captureToCanvas(element);
    } catch {}
    // Prefer canvas -> blob for large pages
    let blob: Blob | null = null;
    if (canvas) {
      blob = await new Promise<Blob | null>(resolve => {
        try { canvas!.toBlob(b => resolve(b), 'image/png'); } catch { resolve(null); }
      });
    }

    if (!blob) return;
    try {
      const { saveAs } = await import('file-saver');
      saveAs(blob, `${this.fileName}.png`);
    } catch {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.fileName}.png`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

