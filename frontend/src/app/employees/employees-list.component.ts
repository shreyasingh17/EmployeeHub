import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Employee, EmployeeQuery } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { HighlightPipe } from './highlight.pipe';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HighlightPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './employees-list.component.html',
  styleUrl: './employees-list.component.css'
})
export class EmployeesListComponent implements OnInit {
  rows: Employee[] = [];
  total = 0;
  loading = false;
  error = '';
  pageIndex = 0;
  pageSize = 10;
  search = '';
  sortBy: keyof Employee = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedIds = new Set<string>();
  departments: string[] = [];

  searchControl: FormControl<string>;
  filterForm: FormGroup;

  columnOptions: { key: keyof Employee; label: string; visible: boolean }[] = [
    { key: 'fullName', label: 'Name', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'department', label: 'Department', visible: true },
    { key: 'role', label: 'Role', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'location', label: 'Location', visible: true },
    { key: 'dateJoined', label: 'Date Joined', visible: true },
    { key: 'salary', label: 'Salary', visible: false }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.searchControl = this.fb.control('', { nonNullable: true });
    this.filterForm = this.fb.group({
      status: this.fb.control(''),
      department: this.fb.control(''),
      dateFrom: this.fb.control(''),
      dateTo: this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.search = value.trim();
      this.pageIndex = 0;
      this.loadEmployees();
    });

    this.filterForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.pageIndex = 0;
      this.loadEmployees();
    });

    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';

    const query: EmployeeQuery = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: this.search,
      status: (this.filterForm.value.status || '') as '' | 'Active' | 'Inactive',
      department: this.filterForm.value.department || '',
      dateFrom: this.filterForm.value.dateFrom || '',
      dateTo: this.filterForm.value.dateTo || '',
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.employeeService.list(query).subscribe({
      next: (result) => {
        this.rows = result.data;
        this.total = result.total;
        this.departments = [...new Set(result.data.map((item) => item.department))].sort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = this.employeeService.toUserMessage(error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  toggleSort(column: keyof Employee): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadEmployees();
  }

  toggleColumn(columnKey: keyof Employee): void {
    const current = this.columnOptions.find((option) => option.key === columnKey);
    if (!current) {
      return;
    }
    current.visible = !current.visible;
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedIds = new Set(this.rows.map((item) => item.id));
      return;
    }
    this.selectedIds = new Set();
  }

  toggleSelectOne(id: string, checked: boolean): void {
    const next = new Set(this.selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.selectedIds = next;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  isAllSelected(): boolean {
    return this.rows.length > 0 && this.selectedIds.size === this.rows.length;
  }

  deleteOne(id: string): void {
    if (!window.confirm('Delete this employee?')) {
      return;
    }

    this.employeeService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Employee deleted', 'Close', { duration: 2000 });
        this.selectedIds = new Set();
        this.loadEmployees();
      },
      error: (error) => this.snackBar.open(this.employeeService.toUserMessage(error), 'Close', { duration: 3000 })
    });
  }

  deleteSelected(): void {
    const ids = Array.from(this.selectedIds);
    if (!ids.length) {
      return;
    }

    if (!window.confirm(`Delete ${ids.length} selected employees?`)) {
      return;
    }

    let completed = 0;
    let hasError = false;

    ids.forEach((id) => {
      this.employeeService.delete(id).subscribe({
        next: () => {
          completed += 1;
          if (completed === ids.length) {
            this.selectedIds = new Set();
            this.loadEmployees();
            if (!hasError) {
              this.snackBar.open('Selected employees deleted', 'Close', { duration: 2000 });
            }
          }
        },
        error: (error) => {
          hasError = true;
          completed += 1;
          this.snackBar.open(this.employeeService.toUserMessage(error), 'Close', { duration: 3000 });
        }
      });
    });
  }

  getDisplayedColumns(): string[] {
    const dynamicColumns = this.columnOptions.filter((option) => option.visible).map((option) => option.key);
    return ['select', ...dynamicColumns, 'actions'];
  }
}
