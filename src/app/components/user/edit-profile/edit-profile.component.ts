import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../auth/auth.service';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import {UserService} from '../../../service/user.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
    AngularEditorModule,
    FormsModule,
    NzIconDirective
  ],
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  currentUser: any = {
    username: '',
    email: '',
    phoneNumber: '',
    password: ''
  };
  isLoading = false;
  userId: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.isLoading = true;
    const currentUser = this.authService.currentUserValue;

    if (!currentUser || !currentUser.id) {
      this.isLoading = false;
      this.message.error('Utilisateur non connecté');
      return;
    }
    this.userId = currentUser.id.toString();
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.currentUser = {
          ...user,
          password: '',
          medecinId: currentUser.medecinId
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message.error('Erreur lors du chargement du profil');
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.medecinId) {
      this.message.error("Impossible de récupérer l'ID du médecin");
      this.isLoading = false;
      return;
    }

    const userToUpdate = { 
      ...this.currentUser,
      medecinId: currentUser.medecinId
    };
    
    if (!userToUpdate.password) {
      delete userToUpdate.password;
    }

    this.userService.updateUser(this.userId, userToUpdate).subscribe({
      next: () => {
        this.message.success('Profil mis à jour avec succès');
        this.isLoading = false;
        this.router.navigate(['/doc/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.message.error(`Erreur: ${err.error?.message || 'Une erreur est survenue'}`);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/doc/dashboard']);
  }
}
