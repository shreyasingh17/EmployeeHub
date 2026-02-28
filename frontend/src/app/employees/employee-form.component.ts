import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../guards/pending-changes.guard';
import { Employee, EmployeeCreate } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit, CanComponentDeactivate {
  isEdit = false;
  loading = false;
  saving = false;
  submitted = false;
  employeeId = '';

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly employeeService: EmployeeService,
    private readonly snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(/^[A-Za-z\s-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+?[1-9]\d{7,14}|[0-9\-\s]{8,15})$/)]],
      department: ['', [Validators.required]],
      role: ['', [Validators.required]],
      status: ['Active', [Validators.required]],
      location: ['', [Validators.required]],
      dateJoined: ['', [Validators.required]],
      salary: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.isEdit = true;
    this.employeeId = id;
    this.loading = true;

    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.form.patchValue(employee);
        this.form.markAsPristine();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(this.employeeService.toUserMessage(error), 'Close', { duration: 3000 });
      }
    });
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving;
  }

  save(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dateJoined = this.form.value.dateJoined ?? '';
    if (dateJoined && new Date(dateJoined) > new Date()) {
      this.form.controls.dateJoined.setErrors({ futureDate: true });
      return;
    }

    this.saving = true;
    const payload = this.buildPayload();

    const request$ = this.isEdit
      ? this.employeeService.update(this.employeeId, { ...payload, id: this.employeeId })
      : this.employeeService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.snackBar.open(this.isEdit ? 'Employee updated' : 'Employee created', 'Close', { duration: 2000 });
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        this.saving = false;
        this.snackBar.open(this.employeeService.toUserMessage(error), 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }

  private buildPayload(): EmployeeCreate {
    return {
      fullName: this.form.value.fullName || '',
      email: this.form.value.email || '',
      phone: this.form.value.phone || '',
      department: this.form.value.department || '',
      role: this.form.value.role || '',
      status: (this.form.value.status as 'Active' | 'Inactive') || 'Active',
      location: this.form.value.location || '',
      dateJoined: this.form.value.dateJoined || '',
      salary: Number(this.form.value.salary ?? 0)
    };
  }
}
