import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  assignRole(userId: number, rolId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/roles`, { rol_id: rolId }, { headers: this.getAuthHeaders() });
  }

  removeRole(userId: number, rolId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/roles`, {
      headers: this.getAuthHeaders(),
      body: { rol_id: rolId }
    });
  }
}
