import { Component } from '@angular/core';
import {AsyncPipe, CommonModule, DatePipe} from '@angular/common';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-disponibilite-medecin-list',
  imports: [
    AsyncPipe,
    CommonModule,
    DatePipe,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzAlertModule,
    NzSpaceModule,
    NzPopconfirmDirective,
    NzModalModule,
    NzToolTipModule
  ],
  templateUrl: './disponibilite-medecin-list.component.html',
  standalone: true,
  styleUrl: './disponibilite-medecin-list.component.scss'
})
export class DisponibiliteMedecinListComponent {

}
