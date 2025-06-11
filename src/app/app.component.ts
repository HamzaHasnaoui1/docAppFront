import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './components/auth/auth.service';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {MainLayoutComponent} from './features/layout/components/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    NzIconDirective,
    RouterOutlet,
    NzButtonModule,
    CommonModule,
    RouterModule,
    MainLayoutComponent,
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'doc-frontend';
  fabMenuOpen = false;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserRole();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get userRole(): 'MEDECIN' | 'SECRETAIRE' {
    if (this.authService.hasRole('ADMIN')) {
      return 'MEDECIN';
    } else if (this.authService.hasRole('USER')) {
      return 'SECRETAIRE';
    }
    return 'SECRETAIRE';
  }

  private checkUserRole(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
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
    return roles.some(role => this.authService.hasRole(role));
  }
}
