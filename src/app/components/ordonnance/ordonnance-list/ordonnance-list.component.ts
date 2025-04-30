import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, DatePipe} from '@angular/common';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {catchError, map, Observable, of, Subject, switchMap} from 'rxjs';
import {Ordonnance} from '../../../models/ordonnance.model';
import {OrdonnanceService} from '../../../service/ordonnance.service';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SearchAddActionsComponent} from '../../../shared/search-add-actions/search-add-actions.component';

@Component({
  selector: 'app-ordonnance-list',
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
    NzToolTipModule,
    SearchAddActionsComponent
  ],
  templateUrl: './ordonnance-list.component.html',
  standalone: true,
  styleUrl: './ordonnance-list.component.scss'
})
export class OrdonnanceListComponent {

}
