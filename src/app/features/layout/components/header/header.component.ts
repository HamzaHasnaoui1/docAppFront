import { Component } from '@angular/core';
// import {
//   NzInputDirective,
//   NzInputGroupComponent,
//   NzInputGroupWhitSuffixOrPrefixDirective,
// } from 'ng-zorro-antd/input';
// import { NzIconDirective } from 'ng-zorroS
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {BrowserModule} from '@angular/platform-browser';
import {icons} from '../../../../icons-provider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterModule,
    NzBadgeModule,
    NzIconModule,
    NzPopoverDirective,
    NgOptimizedImage,
    RouterLink,
    NgTemplateOutlet,
    NzModalModule,
    NzSelectModule,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(private route: Router) {}


  protected readonly icons = icons;
}

