import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeConge } from '../models/type-conge.model';

@Injectable({
  providedIn: 'root'
})
export class TypeCongeService {
  private apiUrl = `${environment.apiUrl}/typeConges`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TypeConge[]> {
    return this.http.get<TypeConge[]>(`${this.apiUrl}/get/list`);
  }

  getById(id: number): Observable<TypeConge> {
    return this.http.get<TypeConge>(`${this.apiUrl}/get/${id}`);
  }

  create(type: TypeConge): Observable<TypeConge> {
    return this.http.post<TypeConge>(`${this.apiUrl}/add`, type);
  }

  update(id: number, type: TypeConge): Observable<TypeConge> {
    return this.http.put<TypeConge>(`${this.apiUrl}/edit/${id}`, type);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}