import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyzeDocumentsService {

  private apiUrl = 'http://localhost:8000/api/analyze-pdf';

  constructor(private http: HttpClient) { }

  analyzeDocuments(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const percentDone = Math.round((100 * event.loaded) / (event.total || 1));
            return { progress: percentDone };
          case HttpEventType.Response:
            return { done: true, body: event.body };
          default:
            return {};
        }
      })
    );
  }


  EcgAnalysis(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post('http://localhost:8000/api/ecg/predict', formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const percentDone = Math.round((100 * event.loaded) / (event.total || 1));
            return { progress: percentDone };
          case HttpEventType.Response:
            return { done: true, body: event.body };
          default:
            return {};
        }
      })
    );
  }

}
