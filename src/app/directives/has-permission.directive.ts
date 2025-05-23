import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../components/auth/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission: string | string[] = [];
  @Input() appHasPermissionMode: 'any' | 'all' = 'any'; // 'any' ou 'all'
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.updateView();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private updateView(): void {
    this.viewContainer.clear();
    
    if (this.checkPermissions()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
  
  private checkPermissions(): boolean {
    if (!this.appHasPermission || (Array.isArray(this.appHasPermission) && this.appHasPermission.length === 0)) {
      return true;
    }
    
    if (typeof this.appHasPermission === 'string') {
      return this.authService.hasPermission(this.appHasPermission);
    }
    
    if (this.appHasPermissionMode === 'any') {
      return this.authService.hasAnyPermission(this.appHasPermission);
    } else {
      return this.authService.hasAllPermissions(this.appHasPermission);
    }
  }
} 