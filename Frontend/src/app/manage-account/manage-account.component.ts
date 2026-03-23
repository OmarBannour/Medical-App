import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './manage-account.component.html',
})
export class ManageAccountComponent implements OnInit {
  showModal: boolean = false;
  allUsers: any[] = [];         // Full list fetched once
  filteredUsers: any[] = [];    // Users after search
  displayedUsers: any[] = [];   // Users shown on current page

  selectedUser: any = {};
  creatModel: boolean = false;
  newUser = {
    name: '',
    email: '',
    role: '',
    password: '',
  };

  curentPage: number = 1;
  LastPage: number = 1;
  itemsPerPage: number = 5;     // Users per page
  loading: boolean = false;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadAllUsers(); // Load all users once
  }

  loadAllUsers() {
    this.loading = true;
    this.errorMessage = ''; // Clear previous errors

    this.authService.getUsers().subscribe({
      next: (response: any) => {
        // Ensure we have a valid array
        if (response && response.data && Array.isArray(response.data)) {
          this.allUsers = response.data;
        } else if (response && Array.isArray(response)) {
          // Handle case where response is directly an array
          this.allUsers = response;
        } else {
          // Fallback to empty array if structure is unexpected
          console.warn('Unexpected API response structure:', response);
          this.allUsers = [];
          this.errorMessage = 'Unexpected data format received.';
        }

        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users.';
        this.allUsers = []; // Ensure it's still an array
        this.filteredUsers = [];
        this.displayedUsers = [];
        this.loading = false;
      }
    });
  }

  applyFilters() {
    // Ensure allUsers is an array before filtering
    if (!Array.isArray(this.allUsers)) {
      console.error('allUsers is not an array:', this.allUsers);
      this.allUsers = [];
    }

    // Step 1: Filter by search term
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      this.filteredUsers = this.allUsers.filter(user =>
        (user?.name && user.name.toLowerCase().includes(search)) ||
        (user?.id && user.id.toString().includes(search)) ||
        (user?.gender && user.gender.toLowerCase().includes(search))
      );
    } else {
      this.filteredUsers = [...this.allUsers];
    }

    // Step 2: Apply pagination
    this.LastPage = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.curentPage = Math.min(this.curentPage, Math.max(1, this.LastPage)); // Ensure current page is valid
    this.updateDisplayedUsers();
  }

  updateDisplayedUsers() {
    const start = (this.curentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedUsers = this.filteredUsers.slice(start, end);
  }

  filterPatients(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.curentPage = 1;
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.LastPage) {
      this.curentPage = page;
      this.updateDisplayedUsers();
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(id).subscribe({
        next: () => {
          this.authService.showSuccess('User deleted successfully!');
          this.loadAllUsers(); // Refresh full list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'Failed to delete user.';
        }
      });
    }
  }

  openModal(user: any = null) {
    this.selectedUser = user ? { ...user } : { name: '', role: '', email: '' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  updateUser() {
    if (this.selectedUser.id) {
      this.authService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
        next: () => {
          this.closeModal();
          this.loadAllUsers();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessage = 'Failed to update user.';
        }
      });
    }
  }
}
