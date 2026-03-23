import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-create-patient',
  imports: [FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './create-patient.component.html',
  standalone: true,

})
export class CreatePatientComponent {
  constructor(private authService: AuthService) {}

  UserName:String ='';
  Email:String ='';
  Password:String ='';
  Role:String ='user';



  CreatePatient(){
    this.authService.createUser({
      name: this.UserName,
      email: this.Email,
      password: this.Password,
      role: this.Role,
    }).subscribe(
      (response) => {
        console.log('Patient created successfully: ', response);
        this.authService.showSuccess('Patient created successfully!');

        // Optionally, reset the form or redirect to another page
        this.UserName = '';
        this.Email = '';
        this.Password = '';
        this.Role = 'user';
      },
      (error) => {
        console.error('Error creating patient: ', error);
        this.authService.showError('Error creating patient!');
      }
    );
  }
}
