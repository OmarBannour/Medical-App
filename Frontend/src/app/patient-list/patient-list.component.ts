import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { MedicalDocumentService } from '../../medical-document.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  standalone: true, // Add this if using Angular 14+
  imports: [FormsModule, CommonModule, SidebarComponent, HeaderComponent]
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];
  isloading: boolean = false;
  medicalRecord: any[] = [];
  patient_id: number | null = null;
  isOpen: boolean = false;
  filterType: 'all'|'male'|'female' = 'all'; // Default filter type
  errorMessage: string = ''; // Property to store error messages
  currentPage: number=1;
  lastPage: number=1;

  SelectedDocument: any = null;
  ShowDocumentModel: boolean = false;
  documentContent: string = '';
  sanitizedDocumentContent: SafeResourceUrl | null = null; // Property to store sanitized document content
  contentType: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private medicalDocument: MedicalDocumentService,
    private http: HttpClient,
    private router: Router,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDocuments();
  }

  loadPatients(page: number = 1): void {
    this.isloading = true;
    this.currentPage=page;

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

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  loadDocuments(): void {
    const user = this.authService.getUser();
    if (!user || user.role !== 'admin' ) {
      alert('Vous devez être connecté en tant que patient pour accéder à cette page.');
      this.router.navigate(['/login']); // Redirect to login page
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      alert('Token manquant. Veuillez vous reconnecter.');
      this.router.navigate(['/login']); // Redirect to login page
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://127.0.0.1:8000/api/documents', { headers }).subscribe(
      (response) => {
        if (user.role === 'admin') {
          this.medicalRecord = response; // Admin sees all medical records
        } else {
          this.medicalRecord = response.filter(doc => doc.patient_id === user.id); // Patient sees only their records
        }
      },
      (error) => {
        console.error('Erreur lors du chargement des documents:', error);
        alert('Erreur lors du chargement des documents.');
      }
    );
  }

  getPatientRecords(patientId: number) {
    return this.medicalRecord.filter(doc => doc.patient_id === patientId);
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

  // See document content - FIXED VERSION
  seeDocument(document: any) {
    this.SelectedDocument = document;
    this.ShowDocumentModel = true;
    this.loading = true; // Set loading state

    this.medicalDocument.ViewMedicalDocument(document.id).subscribe(
      (response: any) => {
        this.contentType = response.mime_type;

        // Handle different content types
        if (this.contentType.startsWith('image/')) {
          // For images
          this.documentContent = 'data:' + this.contentType + ';base64,' + response.content;
        } else if (this.contentType === 'application/pdf') {
          // For PDFs - create a data URL and sanitize it
          const pdfDataUrl = 'data:application/pdf;base64,' + response.content;
          this.sanitizedDocumentContent = this.sanitizer.bypassSecurityTrustResourceUrl(pdfDataUrl);
        } else {
          // For text and other content types
          this.documentContent = response.content;
        }

        this.loading = false; // End loading state
      },
      (error: any) => {
        console.error('Error loading document content:', error);
        this.loading = false; // End loading state on error
        // Optional: Display error message to user
        this.errorMessage = 'Failed to load document content. Please try again.';
      }
    );
  }

  // Helper method to convert base64 to Blob if needed
  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
