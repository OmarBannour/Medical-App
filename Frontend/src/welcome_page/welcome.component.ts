import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../app/navbar/navbar.component';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  imports: [NavbarComponent, CommonModule, FormsModule],
  encapsulation:ViewEncapsulation.None

})
export class WelcomeComponent implements OnInit {
  lastScrollTop: number = 0;
  navbarClass: string = 'navbar-visible';
  showPasswordChangeForm = false;
  confirmPassword = '';
  newPassword = '';
  passwordError = '';
  isUpdating = false;
  email = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if user must change password from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.must_change_password) {
      this.showPasswordChangeForm = true;  // Show the password change form
    } else {
      this.showPasswordChangeForm = false;  // No password change needed
    }
  }

  // Handle password change
  updatePassword() {
    this.passwordError = '';

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      return;
    }

    this.isUpdating = true;

    // Call the updatePassword API to change the user's password
    this.authService.updatePassword(this.newPassword, this.confirmPassword , this.email).subscribe({
      next: (response) => {
        this.isUpdating = false;

        // After successful password update:
        this.showPasswordChangeForm = false;  // Hide the form
        this.newPassword = '';  // Clear the new password input
        this.confirmPassword = '';  // Clear the confirm password input

        // Update localStorage to reflect the password change
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user) {
          user.must_change_password = false;  // Mark the password change as done
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Optionally, show a success message
        alert('Password updated successfully');
      },
      error: (error) => {
        this.isUpdating = false;
        this.passwordError = error.error?.message || 'Error updating password';
        console.error('Error updating password:', error);
      }
    });
  }

  // Optional: Add a logout method
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > this.lastScrollTop) {
      // Scroll Down: Hide navbar
      this.navbarClass = 'navbar-hidden';
    } else {
      // Scroll Up: Show navbar
      this.navbarClass = 'navbar-visible';
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
}
