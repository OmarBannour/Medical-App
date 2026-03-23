import { Component, OnInit } from '@angular/core';
import { CommonModule ,  } from '@angular/common';
import { NgModule } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor(private authService: AuthService) {}
  isOpen: boolean = false;
  name: string = "";
  email: string = "";
  searchText: string = '';

  ngOnInit() {
    this.userInfo();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.authService.logout();
  }

 // get the logged in user info
 userInfo() {
  const user = this.authService.getUser();
  this.name = user.name || '';
  this.email = user.email || '';
}

search() {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchValue = searchInput?.value?.toLowerCase() || '';

  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    const text = item.textContent?.toLowerCase() || '';
    if (text.includes(searchValue)) {
      (item as HTMLElement).classList.remove('hidden');
    } else {
      (item as HTMLElement).classList.add('hidden');
    }
  });
}

}
