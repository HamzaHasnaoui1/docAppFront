import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RdvService {
  constructor(private http: HttpClient) {}

  getRdvs(page: number = 0, size: number = 5): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)

    return this.http.get<any>(`${environment.apiUrl}/user/rdv`, { params });
  }
}
