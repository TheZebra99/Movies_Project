
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// @Injectable tells Angular: "This is a service that can be injected"
// providedIn: 'root' means its a singleton design pattern (create one instance for the whole app)
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // our .NET API base URL
  private baseUrl = 'http://localhost:5284/api';

  // Angular's Dependency Injection automatically provides HttpClient
  constructor(private http: HttpClient) {}

  // generic GET request
  get<T>(endpoint: string, params?: any): Observable<T> { // Observable = A stream of data over time
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  // generic POST request
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  // generic PUT (update) request
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  // generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  // convert object to HttpParams (for query strings)
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }
}