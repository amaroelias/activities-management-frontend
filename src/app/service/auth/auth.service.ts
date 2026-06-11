import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private router: Router) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('google_token');
  }

  public getToken(): string | null {
    return localStorage.getItem('google_token');
  }

  public saveToken(token: string): void {
    localStorage.setItem('google_token', token);
    this.loggedInSubject.next(true);
  }

  public logout(): void {
    localStorage.removeItem('google_token');
    this.loggedInSubject.next(false);
    this.router.navigate(['/']);
  }

  public isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }
}
