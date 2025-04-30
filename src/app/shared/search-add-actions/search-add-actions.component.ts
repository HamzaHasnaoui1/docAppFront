// shared/components/search-add-actions/search-add-actions.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-search-add-actions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './search-add-actions.component.html',
  styleUrls: ['./search-add-actions.component.scss']
})
export class SearchAddActionsComponent {
  @Input() searchPlaceholder: string = 'Rechercher';
  @Input() addButtonText: string = 'Ajouter';
  @Input() debounceTime: number = 300;
  @Output() searchChange = new EventEmitter<string>();
  @Output() addClick = new EventEmitter<void>();

  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keyword: ['']
    });

    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchForm.get('keyword')?.valueChanges
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged()
      )
      .subscribe(val => this.searchChange.emit(val));
  }
}
