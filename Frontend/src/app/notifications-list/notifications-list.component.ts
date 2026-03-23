import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notifications-list.component.html',

  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    NavbarComponent,
  ],
})
export class NotificationListComponent implements OnInit {
  notifications: any[] = [];
  loading = true;
  error: string | null = null;
  PatientName: string = '';

  // Pagination
  current_page: number = 1;
  lastPage: number = 1;

  selectedType: 'all' | 'appointment' | 'medication' | 'reminder' = 'all';
  selectedStatus: string = '';
  selectedCriticality:'all'|'critical'|'normal'= 'all';

  constructor(
    private notificationService: NotificationService,
    private AuthService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.fetchPatientName(); // Fetch the patient name on initialization
  }

  loadNotifications(page: number = 1): void {
    this.current_page = page;
    this.loading = true;
    switch (this.selectedType) {
      case 'all':
        this.notificationService.getNotifications(page).subscribe(
          (response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          },
          (error) => {
            console.error('error loading notfication', error);
            this.loading = false;
          }
        );
        break;
      case 'appointment':
        this.notificationService.AppointmentNotification(page).subscribe(
          (response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          },
          (error) => {
            console.error('error loading notfication', error);
            this.loading = false;
          }
        );
        break;

      case 'medication':
        this.notificationService.MedicationNotification(page).subscribe(
          (response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          },
          (error) => {
            console.error('error loading notfication', error);
            this.loading = false;
          }
        );
        break;
      case 'reminder':
        this.notificationService
          .ReminderNotification(page)
          .subscribe((response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          });
    }
  }


  loadCriticalNotifications(page: number = 1): void {
    this.current_page = page;
    this.loading = true;
    switch (this.selectedCriticality) {
      case 'all':
        this.notificationService.getNotifications(page).subscribe(
          (response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          },
          (error) => {
            console.error('error loading notfication', error);
            this.loading = false;
          }
        );
        break;
      case 'critical':
        this.notificationService.CriticalNotification(page).subscribe(
          (response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          },
          (error) => {
            console.error('error loading notfication', error);
            this.loading = false;
          }
        );
        break;

      case 'normal':
        this.notificationService.NonCriticalNotification(page).subscribe(
          (response: any) => {
            this.notifications = response.data;
            this.current_page = response.current_page;
            this.lastPage = response.last_page;
            this.loading = false;
          },
          (error) => {
            console.error('error loading notfication', error);
            this.loading = false;
          }
        );
        break;
    }
  }

  applyFilters(selectedType: string): void {
    this.selectedType = selectedType as
      | 'all'
      | 'appointment'
      | 'medication'
      | 'reminder';
    this.loadNotifications();
  }

  applyCriticalFilters(selectedCriticality:string): void {
    this.selectedCriticality = selectedCriticality as 'all' | 'critical' | 'normal';
    this.loadCriticalNotifications();
  }

  resetFilters(): void {
    this.selectedType = 'all';
    this.selectedCriticality = 'all';
    this.loadNotifications();
  }

  markASRead(notificationId: number, event: MouseEvent) {
  const notification = this.notifications.find(n => n.id === notificationId);
  if (!notification || notification.is_read) return;

  // Immediately mark as read in UI
  notification.is_read = true;

  // Call service to persist the read state
  this.notificationService.markAsRead(notificationId).subscribe({
    next: () => {
      // No additional UI changes needed
    },
    error: (err) => {
      console.error('Error marking notification as read', err);
      // Revert UI state if API call fails
      notification.is_read = false;
    }
  });
}

  deleteNotification(notificationId: number): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(
            (n) => n.id !== notificationId
          );
        },
        error: (err) => {
          console.error('Error deleting notification:', err);
        },
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getDetailKeys(details: any): string[] {
    if (!details) return [];
    return Object.keys(details);
  }

  fetchPatientName(): void {
    this.AuthService.getPatient().subscribe({
      next: (response: any) => {
        console.log('Patient:', response);
        this.PatientName = response.name; // Store the patient name
      },
      error: (err) => {
        console.error('Error fetching patient name:', err);
      },
    });
  }
}
