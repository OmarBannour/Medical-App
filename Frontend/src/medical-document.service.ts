import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';


@Injectable({
  providedIn: 'root'
})
export class MedicalDocumentService {
  private apiUrl = environment.apiUrl + '/api/documents';

   constructor(private http: HttpClient) { }

   uploadDocument(formData: FormData) {

      return this.http.post(this.apiUrl, formData );
    }

    getDocuments(page:number = 1) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}?page=${page}`, { headers });
    }
    downloadDocument(id: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/${id}/download`, {
        headers,
        responseType: 'blob',
      });
    }
    CountECG(): Observable<number> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<number>(`${this.apiUrl}/EGC/count`, { headers });
    }
    CountReports(): Observable<number> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<number>(`${this.apiUrl}/Report/count`, { headers });
    }
    CountLAbResults(): Observable<number> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<number>(`${this.apiUrl}/lab_result/count`, { headers });
    }

    ViewMedicalDocument(id: number) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/${id}/GetContent`, { headers });
    }

    FilterByWeek() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/filterByweek`, { headers });
    }
    FilterByMonth() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/filterByMonth`, { headers });
    }
    FilterByYear() {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/filterByYear`, { headers });
    }

    FilterReport(){
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/filterReport`, { headers });
    }

    FilterLabResult(){
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/filterLabResult`, { headers });
    }
    FilterECG(){
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`${this.apiUrl}/filterEGC`, { headers });
    }

      DocumentSummary(id:number){
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.apiUrl}/ShowDocumentSummary/${id}`, { headers });
      }


}



