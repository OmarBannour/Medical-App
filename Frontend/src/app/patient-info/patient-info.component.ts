import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { ToastService } from '../../toast.service';
import { NavbarComponent } from "../navbar/navbar.component";


@Component({
  selector: 'app-patient-info',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './patient-info.component.html',
})
export class PatientInfoComponent implements OnInit {

patient:any={
  id: '',
  birthday: '',
  gender: '',
  country: '',
  email: '',
  name: '',

}

constructor(private authservice: AuthService , private toaster:ToastService) {}
ngOnInit(): void {
  this.fetchPatientInfo();
}
fetchPatientInfo() {
  // Directly get the patient information
  this.authservice.getPatient().subscribe(
    (patient) => {
      console.log('Fetched Patient:', patient);
      if (patient && patient.id) {
        // Store the patient ID and other details
        this.patient = {
          id: patient.id, // This is the patient ID we need
          birthday: patient.birthday || '', // Use empty string if NULL
          gender: patient.gender || '', // Use empty string if NULL
          country: patient.country || '',
          email: patient.email || '',
          name: patient.name || '',
        };
      } else {
        console.error('Invalid patient data received');
        this.toaster.show('No valid patient information found.' , 'error');
      }
    },
    (error) => {
      console.error('Error fetching patient details:', error);
      this.toaster.show('Failed to fetch patient information.', 'error');
    }
  );
}

updatePatientInfo() {
  if (!this.patient.id) {
    console.error('Patient ID is missing');
    this.toaster.show('Patient ID is missing. Please log in again.' , 'error');
    return;
  }

  console.log('Patient Data:', this.patient);

  // Call the service to update the patient's information
  this.authservice.updatePatient(this.patient.id, this.patient).subscribe(
    (response) => {
      console.log('Patient info updated:', response);

      if (response && Object.keys(response).length > 0) {
        this.authservice.showSuccess('Patient information updated successfully!');
      } else {
        console.error('Empty response from server');
        this.authservice.showError('Failed to update patient information. Please try again.');
      }
    },
    (error) => {
      console.error('Error updating patient info:', error);
      if (error.status === 422) {
        // Handle validation errors
        const validationErrors = error.error.errors;
        let errorMessage = 'Validation errors:';
        for (const field in validationErrors) {
          errorMessage += `\n- ${field}: ${validationErrors[field].join(', ')}`;
        }
        this.toaster.show(errorMessage);
      } else {
        this.toaster.show('An error occurred while updating patient information.' , 'error');
      }
    }
  );
}
}










