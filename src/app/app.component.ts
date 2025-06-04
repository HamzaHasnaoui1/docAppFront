import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './components/auth/auth.service';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    NzIconDirective,
    RouterOutlet,
    NzButtonModule,
    CommonModule,
    RouterModule
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'doc-frontend';
  fabMenuOpen = false;
  userRole: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getUserRole();
  }

  getUserRole() {

    this.userRole = 'ADMIN';
  }

  toggleFabMenu() {
    this.fabMenuOpen = !this.fabMenuOpen;

    if (this.fabMenuOpen) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  }

  navigateAndCloseFab(route: string) {
    this.router.navigate([route]);
    this.fabMenuOpen = false;
  }

  hasPermission(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer && !fabContainer.contains(event.target)) {
      this.fabMenuOpen = false;
    }
  }
}
