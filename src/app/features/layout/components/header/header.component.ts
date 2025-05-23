import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';

import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { icons } from '../../../../icons-provider';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import { NzSubMenuComponent } from 'ng-zorro-antd/menu';
import { AuthService } from '../../../../components/auth/auth.service';
import { DirectivesModule } from '../../../../directives/directives.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    NgOptimizedImage,
    NgTemplateOutlet,
    NzPopoverDirective,
    NzModalModule,
    NzIconModule,
    NzSelectModule,
    NzButtonModule,
    NzDropDownModule,
    NzBadgeModule,
    NzMenuModule,
    NzDividerComponent,
    NzSubMenuComponent,
    DirectivesModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class HeaderComponent {
  constructor(
    private route: Router,
    public authService: AuthService
  ) {}

  protected readonly icons = icons;

  logout(): void {
    localStorage.clear();
    this.route.navigateByUrl('/login', { skipLocationChange: false }).then(() => {
      window.location.reload();
    });
  }

  edit() {
    this.route.navigate(['/doc/user/edit-profile']);
  }
}
