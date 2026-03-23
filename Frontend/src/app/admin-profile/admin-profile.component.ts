import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent implements OnInit {
  user: any = {
    id: '',
    phone_number: '',
    name: '',
    email: '',
    country: '',
    avatar: '',
    isPublic: false
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.fetchUserInfo();
  }

  fetchUserInfo() {
    this.authService.getCurrentUser().subscribe(
      (user) => {
        console.log('fetched user', user);
        if (user && user.id) {
          this.user = {
            id: user.id,
            name: user.name || '',
            phone_number: user.phone_number || '',
            email: user.email || '',
            country: user.country || '',
            avatar: user.avatar || '',
            isPublic: user.isPublic || false
          };
        } else {
          console.log('no user information to fetch');
        }
      },
      (error) => {
        console.log('error while fetching the user info', error);
      }
    );
  }

  updateUserInfo() {
    if (!this.user.id) {
      console.log('error fetching user info');
      return;
    }

    console.log('user info', this.user);
    this.authService.updateUser(this.user.id, this.user).subscribe(
      (response: any) => {
        console.log('user info updated successfully', response);
        // You could add a success notification here
      },
      (error) => {
        console.log('error while updating user info', error);
        // You could add an error notification here
      }
    );
  }

 updatePassword() {
  // Validation
  if (!this.passwordForm.currentPassword) {
    console.log('Current password is required');
    return;
  }

  if (!this.passwordForm.newPassword) {
    console.log('New password is required');
    return;
  }

  if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
    console.log('New passwords do not match');
    return;
  }

  const passwordData = {
    currentPassword: this.passwordForm.currentPassword,
    newPassword: this.passwordForm.newPassword,
    newPassword_confirmation: this.passwordForm.confirmPassword  // Added this line
  };

  this.authService.updateUserPassword(this.user.id, passwordData).subscribe(
    (response: any) => {
      console.log('Password updated successfully', response);
      // Reset form after successful update
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      // You could add a success notification here
    },
    (error) => {
      console.log('Error updating password', error);
      // You could add an error notification here
    }
  );
 }
}
