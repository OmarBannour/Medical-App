import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Create the form group with validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Email with validation
      password: ['', [Validators.required]]  // Password with required validation
    });
  }

  onSubmit(): void {
    if(this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log("Login Response:", response);

        // Check if user needs to change password
        if (response?.must_change_password === true) {
          // Store user temporarily (without token)
          const tempUser = {
            email: email,
            must_change_password: true
          };
          localStorage.setItem('user', JSON.stringify(tempUser));

          // Redirect to welcome page where password change form will be shown
          this.router.navigate(['/app-welcome']);
          return;
        }

        // Normal login flow with token
        if (response?.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token', response.user.token);
          this.router.navigate(['/app-welcome']);
        } else {
          this.errorMessage = 'Login failed: Missing token or user information.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error("Login failed:", error);

        // Handle specific error responses
        if (error.status === 403) {
          this.errorMessage = 'Access denied: Please check your credentials or permissions.';
        } else {
          this.errorMessage = 'Invalid email or password. Please try again.';
        }
      }
    });
  }
}




