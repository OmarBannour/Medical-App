import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',

  imports: [
    FormsModule,
    CommonModule,
    SidebarComponent,
    HeaderComponent
]
})
export class UploadDocumentComponent implements OnInit {
  title: string = '';
  type: string = '';
  summary: string = '';
  file: File | null = null;
  fileUrl: string | null = null;
  patient_id: string = '';
  patients: any[] = []; // Liste des patients
  selectedPatient: any = null; // Patient sélectionné
  OpenModal: boolean = false; // Modal d'upload
  isOpen: boolean = false; // Dropdown pour la sélection du patient
  loading: boolean = false; // Loading state for filtering patients
  errorMessage: string = ''; // Error message for patient filtering
  filterType: 'all'|'male'|'female' = 'all';  // Default filter type
  curentPage:number=1;
  LastPage:number=1



  constructor(private http: HttpClient , public authService: AuthService ,  private router:Router) {}


 // fetch the patients
 ListeOfPatients(page:number=1) {
  this.curentPage=page
    switch(this.filterType){
      case 'all':
        this.authService.getPatients(page).subscribe(
          (response: any) => {
            this.patients = response.data;
            this.curentPage=response.current_page;
            this.LastPage=response.last_page;
          },
          (error) => {
            console.error('Error loading all patients', error);
          }
        );
        break;
      case 'male':
        this.authService.MalePatients().subscribe(
          (response: any) => {
            this.patients = response.data;
          },
          (error) => {
            console.error('Error loading male patients', error);
          }
        );
        break;
      case 'female':
        this.authService.FemalePatients().subscribe(
          (response: any) => {
            this.patients = response.data;
          },
          (error) => {
            console.error('Error loading female patients', error);
          }
        );
        break;
    }
 }

 setFilter(filterType: string): void {
  // Type cast the string to our union type
  this.filterType = filterType as 'all'|'male'|'female';
  this.ListeOfPatients(); // Reload patients with the new filter
}

 toggleDropdown(){
  this.isOpen = !this.isOpen; // Toggle the dropdown visibility
  console.log('Dropdown ouvert : ', this.isOpen);
 }
  ngOnInit(): void {
    this.ListeOfPatients(); // call the function to fetch patients
  }



  SelectedPatient(){
     // verify that the patient is selected
     if(this.selectedPatient){
      this.patient_id = this.selectedPatient.id; // make sure that the id is selected
      console.log('Patient sélectionné : ', this.selectedPatient.patient_id);
     }
  }

  closeModel(){
    this.OpenModal = false; // Close the modal
    this.file = null; // Reset the file input
    this.fileUrl = null; // Reset the file URL
    this.title = ''; // Reset the title input
    this.type = ''; // Reset the type input
    this.patient_id = '';
    this.summary = '';// Reset the user_id input
    this.selectedPatient = null; // Reset the selected patient

  }

  OpenUploadModal(patient: any) {
    this.selectedPatient = patient;
    this.patient_id = patient.id; // Ensure ID is set correctly here
    this.OpenModal = true;
    console.log('Patient sélectionné : ', this.selectedPatient);
    console.log('Patient ID set to: ', this.patient_id);
  }


  // Gestion de la sélection de fichier
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      this.fileUrl = URL.createObjectURL(file);
    }
  }

  // Fonction d'upload du fichier
  uploadFile(event: Event): void {
    event.preventDefault();

    if (!this.file) {
      alert("Veuillez sélectionner un fichier !");
      return;
    }

    if (!this.isValidFile()) {
      alert("Le fichier sélectionné n'est pas valide.");
      return;
    }

    // Vérifie que patientId est renseigné
    if (!this.patient_id) {
      alert("Veuillez sélectionner un patient.");
      return;
    }

    const formData = new FormData();
    formData.append("title", this.title);
    formData.append("type", this.type);
    formData.append("summary", this.summary);
    formData.append("file", this.file);
    formData.append("patient_id", this.patient_id.toString());  // Convert to string to ensure proper formatting

    console.log('Sending form data:', {
      title: this.title,
      type: this.type,
      summary: this.summary,
      file: this.file.name,
      patient_id: this.patient_id
    });

    this.http.post('http://127.0.0.1:8000/api/documents/upload', formData)
      .subscribe(
        (response: any) => {
          console.log('Fichier téléchargé avec succès : ', response);
          alert('Fichier téléchargé avec succès.');
          this.closeModel(); // Close the modal after successful upload
        },
        (error) => {
          console.error('Erreur lors du téléchargement du fichier : ', error);
          let errorMessage = 'Une erreur est survenue lors du téléchargement du fichier.';

          // Add more specific error messages if available
          if (error.error && error.error.message) {
            errorMessage += ' Détail: ' + error.error.message;
          }

          alert(errorMessage);
        }
      );
  }

  // Fonction pour vérifier que le fichier est bien une image (optionnel)
  isImageFile(): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = this.file?.name.split('.').pop()?.toLowerCase() || '';
    return imageExtensions.includes(fileExtension);
  }

  // Vérification de la validité du fichier sélectionné
  isValidFile(): boolean {
    if (!this.file) return false;
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'xlsx']; // Extensions à ajuster
    const fileExtension = this.file.name.split('.').pop()?.toLowerCase() || '';
    return validExtensions.includes(fileExtension);
  }

  // Récupère le nom du fichier pour l'afficher
  getFileName(): string {
    return this.file ? this.file.name : '';
  }
// Fixed TypeScript function
filterPatients(event: Event): void {
  const input = event.target as HTMLInputElement;
  const searchTerm = input.value.toLowerCase().trim();

  // Reset patients list if search term is empty
  if (!searchTerm) {
    this.ListeOfPatients();
    return;
  }

  // Show loading state (optional)
  this.loading = true;

  this.authService.getPatients().subscribe(
    (allPatients: any) => {
      this.patients = allPatients.data.filter((patient: any) =>
        (patient.name && patient.name.toLowerCase().includes(searchTerm)) || // Filter by name
        (patient.id && patient.id.toString().includes(searchTerm)) ||        // Filter by ID
        (patient.gender && patient.gender.toLowerCase().includes(searchTerm)) // Filter by gender
      );
      this.loading = false;
    },
    (error) => {
      console.error('Error loading patients for filtering:', error);
      this.loading = false;
      // Optional: Show error message to user
      this.errorMessage = 'Failed to load patient data. Please try again.';
    }
  );
}

}

