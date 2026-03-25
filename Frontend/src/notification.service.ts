import { HttpClient,HttpHeaders} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from './environment';



export interface Notification {
  patient_id: number | null;
  user_id: number | null;
  type: string;
  title: string;
  message: string;
  due_date: string;
  read_at: string | null;
  is_critical: boolean;
  details: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = environment.apiUrl + '/api/notifications';
  constructor(private http: HttpClient) { }
   // Get all notifications with filters
  getNotifications(page: number=1): Observable<Notification[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get<Notification[]>(`${this.apiUrl}?page=${page}`, {  headers });
  }

  //create a new notification
  createNotification(notification: Notification): Observable<Notification> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post<Notification>(`${this.apiUrl}/create`, notification , { headers });
  }

  // mark notification as read
  markAsRead(id: number): Observable<Notification> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // Adjust request options and body correctly
    const body = { read_at: null }; // Assuming your backend expects this
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, body, { headers });
  }

  // delete notification
  deleteNotification(id:number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  //get unread notifications
  getUnreadNotifications(): Observable<Notification[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Notification[]>(`${this.apiUrl}/unread-count`, { params: { read_at: 'null' }, headers });
  }

  // mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {params: { read_at: null } });
  }
  countNotifications(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<number>(`${this.apiUrl}/count`, { headers });
  }
  countappointmentNotfications(): Observable<number> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage");
      return new Observable<number>((observer) => {
        observer.error("Token missing");
      });
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<number>(`${this.apiUrl}/appointment-count`, { headers });
  }
  TodayAppointments(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<number>(`${this.apiUrl}/today_appointment`, { headers });
  }

  // charts of notifications
  notificationByMonth(): Observable<any> {
    const token =localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/NumberEvolutionMonthly`, { headers });
  }
  notifiactionByYear(): Observable<any> {
    const token =localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/NumberEvolutionYearly`, { headers });
  }
  notificationByWeek(): Observable<any> {
    const token =localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/NumberEvolutionWeekly`, { headers });
  }

  AppointmentNotification(page:number=1): Observable<Notification[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Notification[]>(`${this.apiUrl}/appointment?page=${page}`, { headers });
  }
  ReminderNotification(page:number=1): Observable<Notification[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Notification[]>(`${this.apiUrl}/reminder?page=${page}`, { headers });
  }
  MedicationNotification(page:number=1): Observable<Notification[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Notification[]>(`${this.apiUrl}/medication?page=${page}`, { headers });
  }

    CriticalNotification(page:number=1){
      const token= localStorage.getItem('token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      return this.http.get<Notification[]>(`${this.apiUrl}/critical?page=${page}`, { headers });
    }

    NonCriticalNotification(page:number=1){
      const token= localStorage.getItem('token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      return this.http.get<Notification[]>(`${this.apiUrl}/non-critical?page=${page}`, { headers });
    }
}

