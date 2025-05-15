import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {AuthService} from '../auth.service';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzAlertComponent} from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzInputModule,
    NzCardModule,
    NzFormModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzAlertComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  year: number = new Date().getFullYear();
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/doc/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.errorMessage = null;
    this.loading = true;

    this.authService.login(this.loginForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/doc/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || "Une erreur est survenue. Veuillez réessayer plus tard.";
        }
      });
  }}
