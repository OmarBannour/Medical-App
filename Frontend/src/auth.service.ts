import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { environment } from './environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(this.getUser()); // Store user info
  user$ = this.userSubject.asObservable(); // Public Observable for components to subscribe
  private tokenExpirationTimer:any;
  private loggedIn = new BehaviorSubject<boolean>(false);


  constructor(private http: HttpClient, private router: Router , private toastr:ToastrService)
  {
    this.autoLogout();
  }

  private apiUrl = environment.apiUrl + '/api';

  handleAuthentication(token: string, expiresAt: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiresAt', expiresAt);
    this.loggedIn.next(true);
    this.autoLogout();
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('mustChangePassword', response.mustChangePassword); // Store flag
      })
    );
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiresAt');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
  autoLogout(): void {
    const expirationDate = new Date(localStorage.getItem('tokenExpiresAt') || '');
    const now = new Date();
    const expiresIn = expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
        alert('Your session has expired. Please login again.');
      }, expiresIn);
    }
  }

  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user); // Notify components of the updated user
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getUserRole(): string {
    return this.getUser()?.role || '';
  }


  getUserName(): Observable<any> {
    return this.getUser().name;
  }

  getUserEmail(): Observable<any> {
    return this.getUser().email;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isUser(): boolean {
    return this.getUserRole() === 'user';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    // Implement the logic to retrieve the token
    return localStorage.getItem('token');
  }
  getUsers(page:number=1): Observable<any> {
    const token= localStorage.getItem('token');
    const headers= new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/users?page=${page}` , {headers});
  }

   getCurrentUser(): Observable<any> {
    const token= localStorage.getItem('token');
    const headers= new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/user`,{headers});
  }
  createUser(user: any): Observable<any> {
    const token= localStorage.getItem('token');
    const headers= new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/users/create`, user , {headers});
  }
  updateUser(id: number, user: any): Observable<any> {
    const token= localStorage.getItem('token');
    const headers= new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/users/${id}/update`, user , {headers});
  }

  updateUserPassword(id: string, passwordData: any) {
    const token= localStorage.getItem('token');
    const headers= new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put(`${this.apiUrl}/users/${id}/update_password`, passwordData , {headers});
  }

  deleteUser(id: number): Observable<any> {
    const token= localStorage.getItem('token');
    const headers= new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/users/${id}/delete` , {headers});
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success');
  }

  showError(message: string) {
    this.toastr.error(message, 'Error');
  }

  getPatients(page: number = 1): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients?page=${page}`, { headers });
  }

  getPatient(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patient/current`, { headers });
  }

  updatePatient(id: number, patient: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Headers:', headers);
    return this.http.put(`${this.apiUrl}/patient/${id}/update`, patient, { headers });
  }
  updatePassword(newPassword: string, confirmPassword: string , email:string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.apiUrl}/updatePassword`, {
      email:email,
      new_password: newPassword,
      confirm_password: confirmPassword
    }, { headers }).pipe(
      tap((response: any) => {
        // Update user in localStorage after successful password change
        if (response && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  countAllPatients(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<number>(`${this.apiUrl}/patients/count`, { headers });
  }

  MalePatients(page:number=1): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients/males?page=${page}`, { headers });

  }
  FemalePatients(page:number=1): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients/females?page=${page}`, { headers });
  }

  PatientsEvolutionMonthly(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients/NumberEvolution`, { headers });
  }

  PatientsEvolutionYearly(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients/NumberEvolutionYearly`, { headers });
  }
  PatientsEvolutionDaily(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients/NumberEvolutionDaily`, { headers });
  }
  PatientsEvolutionWeekly(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/patients/NumberEvolutionWeekly`, { headers });
  }

  getDoctors(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/doctors`, { headers });
  }


}


