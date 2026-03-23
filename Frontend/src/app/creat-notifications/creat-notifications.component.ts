import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ToastrService } from 'ngx-toastr';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-creat-notifications',
  imports: [CommonModule, FormsModule, ToastModule, SidebarComponent, HeaderComponent],
  standalone: true,
  templateUrl: './creat-notifications.component.html',
})
export class CreatNotificationsComponent implements OnInit {
  notification = {
    patient_id: null,
    user_id: null,
    type: '',
    title: '',
    message: '',
    due_date: '',
    read_at: null,
    is_critical: false,
    details: {},
  };
 openModel: boolean = false;
 isOpen: boolean = false;

  patients: any[] = [];
  selectedPatient: any = null;
  FilterType: 'all' | 'male'|'female' = 'all'; // Default filter type
  isloading: boolean = false;
  errorMessage: string = ''; // Property to store error messages

  curentPage: number=1;
  LastPage:number=1;

  constructor(
    private notificationService: NotificationService,
    private authservice: AuthService,
    private toastr: ToastrService
  ) {}

  createNotification() {
    this.notificationService.createNotification(this.notification).subscribe(
      (response) => {
        console.log('Notification created successfully:', response);
        this.authservice.showSuccess('Notification created successfully!');
        this.resetForm(); // Reset the form after successful creation
        this.openModel = false; // Close the modal after successful creation
      },
      (error) => {
        console.error('Error creating notification:', error);
        this.authservice.showError('Error creating Appointment')

      }
    );
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  openOppointmentModal(patient: any) {
    // Set the notification properties directly from the patient object
    this.notification.patient_id = patient.id;
    this.notification.user_id = patient.user_id;

    // Set the selected patient to the one clicked
    this.selectedPatient = patient;

    this.openModel = true;
    console.log('Selected patient ID:', this.notification.patient_id);
    console.log('Selected user ID:', this.notification.user_id);
  }

  closeFromModal() {
    this.openModel = false;
    this.resetForm();
    this.selectedPatient = null;
  }

  resetForm() {
    this.notification = {
      patient_id: null,
      user_id: null,
      type: '',
      title: '',
      message: '',
      due_date: '',
      read_at: null,
      is_critical: false,
      details: {},
    };
  }


  // Function to handle form submission
  onSubmit() {
    this.createNotification();
    // Reset the form or perform any other actions after submission
    const patient_id = this.notification.patient_id;
    const user_id = this.notification.user_id;
    this.notification = {
      patient_id: patient_id,
      user_id: user_id,
      type: '',
      title: '',
      message: '',
      due_date: '',
      read_at: null,
      is_critical: false,
      details: {},
    };
  }
  laodPatients(page:number=1) {
   this.isloading = true;
   this.curentPage=page;
    switch (this.FilterType) {
      case 'male':
        this.authservice.MalePatients().subscribe(
          (response: any) => {
            this.patients = response.data;
            this.isloading = false;
          },

          (error) => {
            console.error('erroor loading male patients', error);
            this.isloading = false;
          }
        );
            break;
      case'female':
        this.authservice.FemalePatients().subscribe(
          (response: any) => {
            this.patients = response.data;
            this.isloading = false;
          },
          (error) => {
            console.error('error loading females patients', error);
            this.isloading = false;
          }
        );
        break;
        case 'all':
          this.authservice.getPatients(page).subscribe(
            (response: any) => {
              this.patients = response.data;
              this.curentPage=response.current_page;
              this.LastPage=response.last_page;
              this.isloading = false;
            },
            (error) => {
              console.error('Error loading all patients', error);
              this.isloading = false;
            }
          );
          break;


  }
}
setFilter(filterType: string): void {
  // Type cast the string to our union type
  this.FilterType = filterType as 'all'|'male'|'female';
  this.laodPatients(); // Reload patients with the new filter
}

  ngOnInit(): void {
    this.laodPatients();
  }
  filterPatients(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase().trim();

    // Reset patients list if search term is empty
    if (!searchTerm) {
      this.laodPatients();
      return;
    }

    // Show loading state (optional)
    this.isloading = true;

    this.authservice.getPatients().subscribe(
      (Response: any) => {
        this.patients = Response.data.filter((patient: any) =>
          (patient.name && patient.name.toLowerCase().includes(searchTerm)) || // Filter by name
          (patient.id && patient.id.toString().includes(searchTerm)) ||        // Filter by ID
          (patient.gender && patient.gender.toLowerCase().includes(searchTerm)) // Filter by gender
        );
        this.isloading = false;
      },
      (error) => {
        console.error('Error loading patients for filtering:', error);
        this.isloading = false;
        // Optional: Show error message to user
        this.errorMessage = 'Failed to load patient data. Please try again.';
      }
    );
  }
}
