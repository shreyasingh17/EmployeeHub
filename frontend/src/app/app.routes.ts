import { Routes } from '@angular/router';
import { pendingChangesGuard } from './guards/pending-changes.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'employees'
	},
	{
		path: 'employees',
		loadComponent: () =>
			import('./employees/employees-list.component').then((m) => m.EmployeesListComponent)
	},
	{
		path: 'employees/new',
		canDeactivate: [pendingChangesGuard],
		loadComponent: () =>
			import('./employees/employee-form.component').then((m) => m.EmployeeFormComponent)
	},
	{
		path: 'employees/:id/edit',
		canDeactivate: [pendingChangesGuard],
		loadComponent: () =>
			import('./employees/employee-form.component').then((m) => m.EmployeeFormComponent)
	},
	{
		path: 'employees/:id',
		loadComponent: () =>
			import('./employees/employee-view.component').then((m) => m.EmployeeViewComponent)
	},
	{
		path: '**',
		loadComponent: () =>
			import('./not-found.component').then((m) => m.NotFoundComponent)
	}
];
