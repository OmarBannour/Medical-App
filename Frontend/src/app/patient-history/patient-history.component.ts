import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { MedicalDocumentService } from '../../medical-document.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-patient-history',
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './patient-history.component.html',
  styleUrl: './patient-history.component.css'
})
export class PatientHistoryComponent implements OnInit {

  patients: any[] = [];
  isloading: boolean = false;
  filterType: 'all'|'male'|'female' = 'all'; // Default filter type
  errorMessage: string = ''; // Property to store error messages
  currentPage: number = 1;
  lastPage: number = 1;

  // New properties for medical history
  selectedPatientId: number | null = null;
  selectedPatientName: string = '';
  patientHistory: any[] = [];
  loadingHistory: boolean = false;
  showHistoryModal: boolean = false;

  constructor(
    private authService: AuthService,
    private medicalDocument: MedicalDocumentService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(page: number = 1): void {
    this.isloading = true;
    this.currentPage = page;

    switch (this.filterType) {
      case 'male':
        this.authService.MalePatients(page).subscribe(
          (response: any) => {
            this.patients = response.data;
            this.isloading = false;
          },
          (error) => {
            console.error('error loading male patients', error);
            this.isloading = false;
          }
        );
        break;
      case 'female':
        this.authService.FemalePatients().subscribe(
          (response: any) => {
            this.patients = response.data;
            this.isloading = false;
          },
          (error) => {
            console.error('error loading female patients', error);
            this.isloading = false;
          }
        );
        break;
      case 'all':
        this.authService.getPatients(page).subscribe(
          (response: any) => {
            this.patients = response.data; // only the array
            this.currentPage = response.current_page;
            this.lastPage = response.last_page;
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
    this.filterType = filterType as 'all'|'male'|'female';
    this.loadPatients(); // Reload patients with the new filter
  }

  // Fixed filter patients method
  filterPatients(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase().trim();

    // Reset patients list if search term is empty
    if (!searchTerm) {
      this.loadPatients();
      return;
    }

    // Show loading state
    this.isloading = true;

    this.authService.getPatients().subscribe(
      (response: any) => {
        this.patients = response.data.filter((patient: any) =>
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

  // Updated method to view patient history
  viewPatientHistory(patient: any): void {
    this.loadingHistory = true;
    this.selectedPatientId = patient.id;
    this.selectedPatientName = patient.name;
    this.showHistoryModal = true;

    this.medicalDocument.DocumentSummary(patient.id).subscribe(
      (response: any) => {
        this.patientHistory = response;
        this.loadingHistory = false;
      },
      (error) => {
        console.error('Error loading patient history:', error);
        this.loadingHistory = false;
        this.errorMessage = 'Failed to load medical history. Please try again.';
      }
    );
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedPatientId = null;
    this.patientHistory = [];
  }

  // Helper method to format dates
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
