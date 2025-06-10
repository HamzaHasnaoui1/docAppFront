import { Component } from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd, RouterLink, RouterLinkActive} from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {AuthService} from '../../../../components/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzAvatarModule,
    NzDropDownModule,
    NzToolTipModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isCollapsed = false;
  currentPageTitle = 'Accueil';
childTitle: string | null = null; // Nouvelle propriété pour le sous-titre

  constructor(
    public authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getRouteTitles())
    ).subscribe(({ mainTitle, childTitle }) => {
      this.currentPageTitle = mainTitle;
      this.childTitle = childTitle;
    });
  }

  private getRouteTitles(): { mainTitle: string; childTitle: string | null } {
    let route = this.activatedRoute;
    let mainTitle = 'Accueil';
    let childTitle: string | null = null;

    // Parcours des routes enfants
    while (route.firstChild) {
      route = route.firstChild;
      
      // Récupération du titre principal
      if (route.snapshot.data['title']) {
        mainTitle = route.snapshot.data['title'];
      }
      
      // Récupération du sous-titre enfant
      if (route.snapshot.data['childTitle']) {
        childTitle = route.snapshot.data['childTitle'];
      }
    }

    return { mainTitle, childTitle };
  }


  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login', { skipLocationChange: false }).then(() => {
      window.location.reload();
    });
  }

  edit() {
    this.router.navigate(['/doc/user/edit-profile']);
  }
}
