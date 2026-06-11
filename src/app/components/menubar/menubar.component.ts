import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  menuActive = false;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.menuActive = !this.menuActive;
  }

  logout(): void {
    this.authService.logout();
  }
}
