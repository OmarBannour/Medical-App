import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [FormsModule]
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  password: string = '';
  password_confirmation: string = '';
  token: string = '';

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || ''; // Get token from URL query parameters
    this.email = this.route.snapshot.paramMap.get('email') || '';
  }

  onSubmit(): void {
    if (!this.token) {
      alert('Invalid or expired reset link.');
      return;
    }

    if (this.password !== this.password_confirmation) {
      alert('Passwords do not match');
      return;
    }

    if (this.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    const resetData = {

      email: this.email,
      token: this.token,
      password: this.password,
      password_confirmation: this.password_confirmation

    };

    this.authService.resetPassword(resetData).subscribe(
      (response) => {
        alert('Password reset successfully!');
        this.router.navigate(['app-login']);
      },
      (error) => {
        alert('There was an error resetting your password');
        console.error(error);
      }
    );
  }

}
