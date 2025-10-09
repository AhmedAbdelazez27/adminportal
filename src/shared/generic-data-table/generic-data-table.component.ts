import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy
} from '@angular/core';
import { ColDef, GridReadyEvent, GridApi, GridOptions } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { TranslationService } from '../../app/core/services/translation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-generic-data-table',
  templateUrl: './generic-data-table.component.html',
  styleUrls: ['./generic-data-table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, TranslateModule]
})
export class GenericDataTableComponent implements OnChanges, OnInit, OnDestroy {
  private _columnDefs: ColDef[] = [];
  @Input() set columnDefs(value: ColDef[]) {
    this._columnDefs = value || [];
    this.ensureActionPin();
  }
  get columnDefs(): ColDef[] {
    return this._columnDefs;
  }

  @Input() rowData: any[] = [];
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 0;
  @Input() showActionColumn: boolean = false;
  @Input() columnHeaderMap: { [key: string]: string } = {};
  @Input() rowActions: Array<{ label?: string; labelKey?: string; icon?: string; action: string }> = [];

  @Input() set actions(value: Array<{ label?: string; labelKey?: string; icon?: string; action: string }>) {
    this.rowActions = value || [];
    this.translateActionLabels();
  }

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Input() gridOptions: GridOptions = {};
  @Output() pageChange = new EventEmitter<{ pageNumber: number; pageSize: number }>();
  @Output() search = new EventEmitter<string>();
  @Output() languageChanged = new EventEmitter<void>();

  searchText: string = '';
  totalPages: number = 0;
  Math = Math;

  showInfoModal: boolean = false;
  selectedRowData: any = null;
  public selectedRowKeysArr: string[] = [];
  mainColumns = this.columnDefs.slice(0, 4); 
  showGrid: boolean = true;

  // context menu state
  openMenuRowId: string | null = null;
  menuX: number = 0;
  menuY: number = 0;

  inputPage: number = 1;

  @ViewChild('actionMenu', { static: false }) actionMenu!: ElementRef;

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: false,
    wrapText: true,
    autoHeight: true,
    minWidth: 80
  };


  private destroy$ = new Subject<void>();
  public api!: GridApi;
  public isRtl = false;

  // فريد لكل instance
  private uniqueId: string = 'gdt-' + Math.random().toString(36).slice(2, 9) + '-' + Date.now().toString(36);

  @ViewChild('menuRef', { static: false }) menuRef!: ElementRef<HTMLElement>;

  constructor(
    private translationService: TranslationService,
    private translate: TranslateService,
    private el: ElementRef<HTMLElement>
  ) {
    const lang = (localStorage.getItem('lang') as string) || this.translationService?.currentLang || 'en';
    this.isRtl = lang.startsWith('ar');
  }

  ngOnInit() {
    this.translationService.langChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onLanguageChange();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // helper لو محتاج تقفل المينو برمجياً من الأب (مثلاً عند فتح مودال)
  public closeActionMenu(): void {
    this.openMenuRowId = null;
  }

  onLanguageChange() {
    this.applyRtl();
    this.updateHeaderTranslations();
    this.translateActionLabels();
    this.showGrid = false;
    setTimeout(() => {
      this.showGrid = true;
    });
    this.languageChanged.emit();
  }

  private updateHeaderTranslations() {
    if (!this.columnDefs) return;
    this.columnDefs.forEach((col) => {
      if (col.colId === 'action') {
        col.headerName = this.translate.instant('COMMON.ACTIONS');
      }
    });
  }

  private translateActionLabels() {
    if (!this.rowActions) return;
    this.rowActions.forEach((a) => {
      const key = a.labelKey || a.label;
      a.label = this.translate.instant(key as string);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.columnDefs && this.columnDefs.length) {
      this.columnDefs.forEach((col) => {
        if (col.colId === 'action') {
          col.pinned = this.isRtl ? 'left' : 'right';
        }
      });
    }
    if (changes['rowData'] || changes['totalCount'] || changes['pageSize']) {
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    }
    this.inputPage = this.currentPage + 1;

    if (this.showActionColumn && this.columnDefs && !this.columnDefs.some((col) => col.colId === 'action')) {
      const newColumnDefs = [...this.columnDefs];
      newColumnDefs.push({
        headerName: this.translate.instant('COMMON.ACTIONS'),
        colId: 'action',
        cellRenderer: this.actionCellRenderer,
        width: 100,
        pinned: this.isRtl ? 'left' : 'right',
        suppressMenu: true,
        suppressMovable: true,
        filter: false,
        sortable: false
      });
      this.columnDefs = newColumnDefs;
    }
    const actionCol = this.columnDefs.find((col) => col.colId === 'action');
    if (actionCol) {
      actionCol.pinned = this.isRtl ? 'left' : 'right';
    }
    if (this.api && (changes['rowData'] || changes['columnDefs'])) {
      const columnApi = (this.api as any).columnApi || (this.api as any).getColumnApi?.();
      setTimeout(() => this.adjustColumnSizing(columnApi, this.api), 80);
    }
    //if (this.api) {
    //  this.api.applyColumnState({
    //    state: [{ colId: 'action', pinned: this.isRtl ? 'left' : 'right' }],
    //    applyOrder: true
    //  });
    //}
  }

  actionCellRenderer = (params: any) => {
    const rowId = (params.data?.id ?? params.node.rowIndex).toString();
    return `
      <button class='btn btn-link p-0 action-kebab-btn'
              aria-label='Actions'
              data-row-id='${rowId}'
              data-table-id='${this.uniqueId}'>
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='10' cy='4' r='1.5' fill='#495057'/>
          <circle cx='10' cy='10' r='1.5' fill='#495057'/>
          <circle cx='10' cy='16' r='1.5' fill='#495057'/>
        </svg>
      </button>
    `;
  };

  private getDisplayedCols(columnApi: any) {
    if (typeof columnApi.getAllDisplayedColumns === 'function') {
      return columnApi.getAllDisplayedColumns();
    }
    if (typeof columnApi.getAllGridColumns === 'function') {
      return columnApi.getAllGridColumns();
    }
    const state = columnApi.getColumnState ? columnApi.getColumnState() : [];
    return state.map((s: any) => ({ getColId: () => s.colId, getActualWidth: () => s.width || 100 }));
  }

 
  private adjustColumnSizing(columnApi: any, api: any) {
    if (!columnApi || !api) return;

    const displayedCols = this.getDisplayedCols(columnApi);
    const colIds = displayedCols.map((c: any) => c.getColId());

    const gridHost = this.el.nativeElement.querySelector('.ag-theme-alpine') as HTMLElement;
    const gridWidth = (gridHost && gridHost.clientWidth) || window.innerWidth;

    if (displayedCols.length <= 8) {
      // 👉 Few columns → stretch to fill grid
      try {
        api.sizeColumnsToFit();
      } catch (e) {
        console.warn('sizeColumnsToFit error', e);
      }
    } else {
      // 👉 Many columns → cap width and allow wrapping
      const maxWidth = 200;
      displayedCols.forEach((col: any) => {
        try {
          columnApi.setColumnWidth(col.getColId(), maxWidth, false);
        } catch (e) {
          try { columnApi.setColumnWidth(col, maxWidth, false); } catch { }
        }
      });
    }

    // Always recalc row heights so wrapped text shows correctly
    setTimeout(() => {
      api.resetRowHeights();
    }, 50);
  }

  onGridReady(event: GridReadyEvent) {
    this.api = event.api;

    // ensure rtl/pins and defs as you already have
    this.applyRtl();
    this.ensureActionPin();
    this.api.setColumnDefs([...this.columnDefs]);

    // run sizing once grid & columns are ready
    setTimeout(() => {
      this.adjustColumnSizing(event.columnApi, event.api);
    }, 50);

    // run on resize
    window.addEventListener('resize', () => {
      // throttle lightly if you want
      if (this.api) {
        this.adjustColumnSizing((this.api as any).columnApi || (event as any).columnApi, this.api);
      }
    });

    // preserve your existing listeners
    this.api.addEventListener('cellClicked', (agEvt: any) => {
      if (agEvt.colDef.colId === 'action' && agEvt.event?.target) {
        const action = agEvt.event.target.getAttribute('data-action');
        if (action) {
          this.actionClick.emit({ action, row: agEvt.data });
        }
      }
    });
  }

  private applyRtl() {
    const lang = this.translationService?.currentLang || 'en';
    this.isRtl = lang.startsWith('ar');
    if (this.api) {
      const pinSide = this.isRtl ? 'left' : 'right';
      this.api.setColumnPinned('action', pinSide as any);
      if ((this.api as any).setEnableRtl) {
        (this.api as any).setEnableRtl(this.isRtl);
      }
      this.api.refreshHeader();
    }
  }

  onViewInfo(row: any) {
    this.selectedRowData = row;
    this.selectedRowKeysArr = Object.keys(row);
    this.showInfoModal = true;
  }

  closeInfoModal() {
    this.showInfoModal = false;
    this.selectedRowData = null;
    this.selectedRowKeysArr = [];
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.emitPageChange();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.emitPageChange();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.inputPage = page + 1;
      this.emitPageChange();
    }
  }

  onPageSizeChanged(size: string) {
    this.pageSize = +size;
    this.currentPage = 0;
    this.inputPage = 1;
    this.emitPageChange();
  }

  emitPageChange() {
    this.pageChange.emit({ pageNumber: this.currentPage + 1, pageSize: this.pageSize });
  }

  onSearchInput() {
    this.search.emit(this.searchText);
  }

  onMenuAction(action: string) {
    const key = this.openMenuRowId;
    const row = this.rowData.find((r, idx) => (r?.id ?? idx).toString() === key);
    this.actionClick.emit({ action, row });
    this.openMenuRowId = null;
  }


  private ensureActionPin() {
    if (!this._columnDefs) return;
    this._columnDefs.forEach((col) => {
      if (col.colId === 'action') {
        col.pinned = this.isRtl ? 'left' : 'right';
      }
    });
  }


@HostListener('window:scroll')
@HostListener('window:resize')
onWindowChange() {
  // when scroll close it
  this.openMenuRowId = null;
}

@HostListener('document:click', ['$event'])
onDocumentClick(ev: MouseEvent) {
  const target = ev.target as HTMLElement;

  // Actions btn click
  const btn = target.closest('.action-kebab-btn') as HTMLElement | null;
  if (btn) {
    const btnTableId = btn.getAttribute('data-table-id');
    if (btnTableId !== this.uniqueId) {
      this.openMenuRowId = null;
      return;
    }

    const btnRect = btn.getBoundingClientRect();

    this.openMenuRowId = btn.getAttribute('data-row-id');

    setTimeout(() => {
      const menuEl = this.menuRef?.nativeElement;
      const menuW = menuEl?.offsetWidth ?? 200;
      const menuH = menuEl?.offsetHeight ?? (48 * (this.rowActions.length || 1));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 8;

      // Y: تحت لو في مساحة، غير كده فوق
      let y = (vh - btnRect.bottom >= menuH + margin)
        ? btnRect.bottom
        : (btnRect.top - menuH);

      // X: حسب RTL/LTR
      let x = this.isRtl
        ? btnRect.left  
        : (btnRect.right - menuW); 

      // Clamp جوّه الشاشة
      if (x < margin) x = margin;
      if (x + menuW > vw - margin) x = vw - menuW - margin;
      if (y < margin) y = margin;
      if (y + menuH > vh - margin) y = vh - menuH - margin;

      this.menuX = Math.round(x);
      this.menuY = Math.round(y);
    }, 0);

    return;
  }

  const clickedInsideMenu = !!target.closest('.context-menu');
  if (clickedInsideMenu) return;

  this.openMenuRowId = null;
}

}
