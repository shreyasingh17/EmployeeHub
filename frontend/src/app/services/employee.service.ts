import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Employee, EmployeeCreate, EmployeeQuery, PagedResult } from '../models/employee.model';

interface ApiError {
  message: string;
  status?: number;
  retryable: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly baseUrl = 'http://localhost:3000/employees';

  constructor(private readonly http: HttpClient) {}

  list(query: EmployeeQuery): Observable<PagedResult<Employee>> {
    let params = new HttpParams()
      .set('_page', String(query.page))
      .set('_limit', String(query.pageSize))
      .set('_sort', query.sortBy)
      .set('_order', query.sortDirection);

    if (query.search.trim()) {
      params = params.set('q', query.search.trim());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.department.trim()) {
      params = params.set('department', query.department.trim());
    }
    if (query.dateFrom) {
      params = params.set('dateJoined_gte', query.dateFrom);
    }
    if (query.dateTo) {
      params = params.set('dateJoined_lte', query.dateTo);
    }

    return this.http
      .get<Employee[]>(this.baseUrl, {
        observe: 'response',
        params
      })
      .pipe(
        map((response: HttpResponse<Employee[]>) => {
          const data = response.body ?? [];
          const total = Number(response.headers.get('X-Total-Count') ?? data.length);

          return {
            data,
            total,
            page: query.page,
            pageSize: query.pageSize
          };
        }),
        catchError((error) => throwError(() => this.mapApiError(error)))
      );
  }

  getById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`).pipe(catchError((error) => throwError(() => this.mapApiError(error))));
  }

  create(payload: EmployeeCreate): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, payload).pipe(catchError((error) => throwError(() => this.mapApiError(error))));
  }

  update(id: string, payload: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, payload).pipe(catchError((error) => throwError(() => this.mapApiError(error))));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError((error) => throwError(() => this.mapApiError(error))));
  }

  toUserMessage(error: ApiError): string {
    return error.retryable ? `${error.message} You can try again.` : error.message;
  }

  private mapApiError(error: { status?: number; error?: { message?: string } }): ApiError {
    const status = error?.status;
    const message = error?.error?.message ?? 'Something went wrong. Please try again.';
    const retryable = status === 0 || status === 408 || status === 429 || status === 500 || status === 503;

    return { message, status, retryable };
  }
}
