import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { MedicalDocumentService } from '../../medical-document.service';
@Component({
  selector: 'app-download-patient-document',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './download-patient-document.component.html',

})
export class DownloadPatientDocumentComponent implements OnInit {
  documents: any[] = [];
  Patient_id: number = 0;
  selectedType: string = '';
  name : String='';
  current_page: number = 1;
  last_page: number = 1;


  SelectedDocument: any = null;
  ShowDocumentModel: boolean = false;
  documentContent: string = '';
  sanitizedDocumentContent: SafeResourceUrl | null = null; // Property to store sanitized document content
  contentType: string = '';
  loading: boolean = false;
  errorMessage: string = ''; // Property to store error messages

  constructor(private http: HttpClient, public authService: AuthService, private medicalDocumentService: MedicalDocumentService, private sanitizer: DomSanitizer) {}


  ngOnInit(): void {
    this.loadDocuments();
   this.DoctorInfo();


  }

  loadDocuments(page: number = 1): void {
    this.loading = true;
    this.current_page = page;

    const user = this.authService.getUser();
    if (!user || user.role !== 'user') {
      alert('Vous devez être connecté en tant que patient pour accéder à cette page.');
      this.loading = false;
      return;
    }

    // Store the patient ID from the user object for reference
    this.Patient_id = user.patient_id;

    const token = this.authService.getToken();
    if (!token) {
      alert('Token manquant');
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Use query parameters to paginate and get only documents for this patient
    // The backend will handle filtering based on the authenticated user's patient relationship
    this.http.get<{ data: any[], current_page: number, last_page: number }>(
      `http://127.0.0.1:8000/api/documents?page=${page}`,
      { headers }
    ).subscribe(
      (response) => {
        this.documents = response.data;
        console.log(response);
        this.current_page = response.current_page;
        this.last_page = response.last_page;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading documents:', error);
        this.errorMessage = 'Erreur lors du chargement des documents';
        this.loading = false;
      }
    );
  }

  downloadDocument(doc: any): void {
    // Get token from the AuthService or localStorage
    const token = this.authService.getToken();

    // Add token to the request header
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://127.0.0.1:8000/api/documents/${doc.id}/download`, {
      headers,
      responseType: 'blob'
    }).subscribe(
      (response) => {
        const blob = new Blob([response], { type: response.type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');  //
        a.href = url;
        a.download = doc.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error(error);
        alert('Une erreur est survenue lors du téléchargement du fichier.');
      }
    );
}
// filter documents by type
filterByType($event: any): void {
  this.selectedType = $event.target.value;

  switch(this.selectedType){
    case 'all':
      this.loadDocuments();
      break;
      case 'Report':
        this.medicalDocumentService.FilterReport().subscribe(
          (Response: any) => {
            this.documents = Response;
            console.log(Response);
            this.current_page = Response.current_page;
            this.last_page = Response.last_page;
          },
          (error) => {
            console.error(error);
            alert('Erreur lors du chargement des documents');
          });
        break;
        case 'EGC':
          this.medicalDocumentService.FilterECG().subscribe(
            (Response:any)=>{
              this.documents = Response;
              console.log(Response);
            },
            (error)=>{
              console.error(error);
              alert('Error while loading documents');
            }
          );
          break;
        case 'Lab Results':
          this.medicalDocumentService.FilterLabResult().subscribe(
            (Response:any)=>{
              console.log(Response);
              this.documents = Response;

            },
            (error)=>{
              console.error(error);
              alert('Error while loading documents');
            }
          );
          break;
  }
}
//filter documents by date
FilterByDate($event: any){
  this.selectedType = $event.target.value;
  switch(this.selectedType){
    case 'all':
      this.loadDocuments();
      break;
    case "week":
      this.medicalDocumentService.FilterByWeek().subscribe(
        (Response:any)=>{
          this.documents = Response;
          console.log(Response);
        },
        (error)=>{
            console.error(error);
            alert('Error while loading documents');
        }
      );
      break;
      case 'month':
        this.medicalDocumentService.FilterByMonth().subscribe(
          (Response:any)=>{
            this.documents = Response;
            console.log(Response);
          },
          (error)=>{
            console.error(error);
            alert('Error while loading documents');
          }
        );
        break;
        case 'year':
          this.medicalDocumentService.FilterByYear().subscribe(
            (Response:any)=>{
              this.documents = Response;
              console.log(Response);
            },
            (error)=>{
              console.error(error);
              alert('Error while loading documents');
            }
          );
          break;
  }

}

 quickView(document: any) {
  this.SelectedDocument = document;
  this.ShowDocumentModel = true;
  this.loading = true; // Set loading state

  this.medicalDocumentService.ViewMedicalDocument(document.id).subscribe(
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

DoctorInfo() {
  this.authService.getDoctors().subscribe((Doctor: any) => {

    // Access the first element of the array
    if (Doctor && Doctor.length > 0) {
      this.name = Doctor[0].name; // Get name from the first doctor object

    } else {
      console.log('No doctor data found or empty array');
    }
  }, (error) => {
    console.error('Error fetching doctor information:', error);
  });
}

}
