import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  constructor(private http: HttpClient) {}

  sendReminders(): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/admin/reminders/send`, {});
  }
} 