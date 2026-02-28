export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	department: string;
	role: string;
	status: EmployeeStatus;
	location: string;
	dateJoined: string;
	salary: number;
}

export type EmployeeCreate = Omit<Employee, 'id'>;

export interface EmployeeQuery {
	page: number;
	pageSize: number;
	search: string;
	status: '' | EmployeeStatus;
	department: string;
	dateFrom: string;
	dateTo: string;
	sortBy: keyof Employee;
	sortDirection: 'asc' | 'desc';
}

export interface PagedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
}
