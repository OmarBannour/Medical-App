import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { ToastService } from '../../toast.service';

@Component({
  selector: 'app-permissions',
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  standalone: true,
  templateUrl: './permissions.component.html',

})
export class PermissionsComponent implements  OnInit {

  constructor(private authService: AuthService , private toaster:ToastService) {}

  users: any[] = []; // list of users
  selectedUser: any = null; // selected user
  id: number = 0; // user id
  permisson: string = ''; // user permission
  isOpen: boolean = false; // toggle for the permission modal
  username:string = ''; // user name


  ngOnInit(): void {
    this.fetchUsers(); // call the function to fetch users
  }

  fetchUsers(){
    this.authService.getUsers().subscribe(
      (response: any) => {
        this.users = response.data; // Ensure the response contains user data
      },
      (error) => {
        console.error('Error fetching users: ', error);
      }
    );
  }

  // get the user logged in
  LogInUsre(){
    this.authService.getUser().subscribe(
      (user: any) => {
        this.username = user.name;
        console.log(this.username);
        return this.username
      }
    )
  }

  toggleDropdown(){
    this.isOpen = !this.isOpen; // toggle the dropdown
  }

  selectUser(){
    this.id = this.selectedUser.id; // make sure that the id is selected
    console.log('Selected user: ', this.selectedUser.id);
  }

  updatePermission(){
    this.authService.updateUser(this.id, this.selectedUser).subscribe(
      (response: any) => {
        console.log('User updated successfully: ', response);
        this.authService.showSuccess('User updated successfully!');
        this.fetchUsers(); // Refresh the list of users after updating
      },
      (error) => {
        console.error('Error updating user: ', error);
        this.authService.showSuccess('Error updating user!');
      }

    )
  }
}
