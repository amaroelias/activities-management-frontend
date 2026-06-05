import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API = `${environment.apiUrl}/user`;

  constructor(private httpClient: HttpClient) {}

  getUsers() {
    return this.httpClient.get<string[]>(`${this.API}/getUsers`);
  }
}
