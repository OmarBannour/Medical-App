import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-forget-password',
  imports: [FormsModule ],
  standalone:true,
  templateUrl: './forget-password.component.html',

})
export class ForgetPasswordComponent {

  email: string= '';

  constructor(private authService : AuthService ){}

  sendResetEmail(){
    this.authService.forgotPassword(this.email).subscribe(
      (response:any) => {
        this.authService.showSuccess('Reset link sent to email');
      },
      (error) => {
        this.authService.showError('Failed to send email');
        console.error(error);
      }

    )
  }


}
