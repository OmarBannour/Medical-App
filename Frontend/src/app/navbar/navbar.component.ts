import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, FormsModule],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isMobileMenuOpen = false;
  notificationCount: number = 0;
  isNavbarVisible = true;
  lastScrollPosition = 0;
  scrollThreshold = 20; // Minimum scroll distance to trigger hide/show

  constructor(
    public authService: AuthService,
    private router: Router,
    private notifiaction: NotificationService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Get current scroll position
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Determine scroll direction and if threshold is exceeded
    if (currentScrollPosition > this.lastScrollPosition &&
        currentScrollPosition > this.scrollThreshold) {
      // Scrolling down & past threshold - hide navbar
      this.isNavbarVisible = false;
    } else if (currentScrollPosition < this.lastScrollPosition) {
      // Scrolling up - show navbar
      this.isNavbarVisible = true;
    }

    // Save current position for next comparison
    this.lastScrollPosition = currentScrollPosition;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  ngOnInit(): void {
    // Subscribe to user$ (observable) to dynamically update navbar
    this.authService.user$.subscribe((user) => {
      this.isLoggedIn = this.authService.isLoggedIn();
      this.isAdmin = user?.role === 'admin';
    });

    this.notifiaction.countNotifications().subscribe(count => {
      this.notificationCount = count;
    });
  }

  logout() {
    this.router.navigate(['/app-login']);
  }
}





