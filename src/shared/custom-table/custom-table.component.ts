import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class CustomTableComponent implements OnChanges {
  @Input() headers: string[] = [];
  @Input() headerKeys: string[] = [];
  @Input() rows: any[] = [];
  @Input() showAction: boolean = false;
  @Input() actionTypes: string[] = [];

  @Input() pagination: any = {
    currentPage: 1,
    totalCount: 0,
    take: 10,
    pages: []
  };

  @Output() onViewDetails = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onChangePage = new EventEmitter<number>();
  @Output() onChangePerPage = new EventEmitter<number>();

  totalPages: number = 0;

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagination']) {
      this.totalPages = Math.ceil(this.pagination.totalCount / this.pagination.take);
      this.calculatePages();
    }
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.pagination.totalCount / this.pagination.take);
    const current = this.pagination.currentPage;

    let startPage = Math.max(current - 1, 1);
    let endPage = Math.min(startPage + 2, this.totalPages);

    if (endPage - startPage < 2) {
      startPage = Math.max(endPage - 2, 1);
    }

    this.pagination.pages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pagination.pages.push(i);
    }
  }

  changePage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;

    this.pagination.currentPage = page;
    this.calculatePages();
    this.onChangePage.emit(page);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.take = perPage;
      this.pagination.currentPage = 1;
      this.calculatePages();
      this.onChangePerPage.emit(perPage);
    }
  }

  getSerialNumber(index: number): number {
    const currentPage = this.pagination.currentPage || 1;
    const itemsPerPage = this.pagination.take || 10;
    return (currentPage - 1) * itemsPerPage + index + 1;
  }
}
