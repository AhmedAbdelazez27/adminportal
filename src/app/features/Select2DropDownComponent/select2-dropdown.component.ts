import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { Observable, Subject, debounceTime, switchMap, tap } from "rxjs";

@Component({
  selector: 'app-select2-dropdown',
  standalone: true,
  imports: [NgSelectModule, FormsModule, CommonModule],
  template: `
<ng-select
  [items]="items"
  [loading]="loading"
  [bindLabel]="config?.bindLabel || ''"
  [bindValue]="config?.bindValue || ''"
  [placeholder]="config?.placeholder || ''"
  [typeahead]="searchInput$"
  [(ngModel)]="selected"
  (search)="onSearch($event)"
  (scrollToEnd)="loadMore()"
  (change)="onChange.emit(selected)">
</ng-select>`
})
export class Select2DropdownComponent implements OnInit {
  @Input() config!: {
    fetchFn: (term: string, page: number) => Observable<any[]>,
    placeholder: string,
    bindLabel: string,
    bindValue: string
  };

  @Output() onChange = new EventEmitter<any>();

  items: any[] = [];
  searchInput$ = new Subject<string>();
  selected: any;
  loading = false;
  page = 1;
  lastTerm = '';

  ngOnInit() {
    this.searchInput$
      .pipe(
        debounceTime(300),
        switchMap(term => {
          this.page = 1;
          this.lastTerm = term;
          this.loading = true;
          return this.config.fetchFn(term, this.page).pipe(
            tap(() => this.loading = false)
          );
        })
      )
      .subscribe(data => this.items = data);
  }

  onSearch(term: string) {
    this.searchInput$.next(term);
  }

  loadMore() {
    this.page++;
    this.loading = true;
    this.config.fetchFn(this.lastTerm, this.page).subscribe(moreItems => {
      this.items = [...this.items, ...moreItems];
      this.loading = false;
    });
  }
}
