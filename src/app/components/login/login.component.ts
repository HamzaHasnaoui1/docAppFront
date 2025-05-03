/*
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    RouterModule,
    NzCardComponent,
    ReactiveFormsModule
  ]
})
export class LoginComponent {
  validateForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router, private authService : AuthService) {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isLoading = true;
      const { username, password } = this.validateForm.value;
      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/doc/dashboard']);
        },
        error: () => {
          this.validateForm.setErrors({ invalidLogin: true });
          this.isLoading = false;
        },
      });
    }
  }


  private markFormControlsAsDirty(): void {
    Object.values(this.validateForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  private handleRememberMe(): void {
    const { remember, username } = this.validateForm.value;
    remember
      ? localStorage.setItem('username', username)
      : localStorage.removeItem('username');
  }
}
*/
