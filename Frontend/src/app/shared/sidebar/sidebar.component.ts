import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [  CommonModule],
  templateUrl: './sidebar.component.html',

})
export class SidebarComponent {

isOpen = false;
toggleDropdown() {
    this.isOpen = !this.isOpen;
}
// Close the dropdown if clicked outside
closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.dropdown-toggle')) {
        this.isOpen = false;
    }
  }

  // search function



}
