import { Component, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ResponseService } from 'src/app/service/response/response.service';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private responseService: ResponseService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', type: 'standard', shape: 'pill', text: 'signin_with', logo_alignment: 'left' }
      );
    } else {
      this.errorMessage = 'Não foi possível carregar o serviço de autenticação do Google. Verifique sua conexão.';
    }
  }

  handleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      this.loading = true;
      this.errorMessage = '';
      const jwtToken = response.credential;
      
      // Salva o token temporariamente no localStorage para validar o acesso na API do backend
      this.authService.saveToken(jwtToken);

      // Efetua uma chamada teste protegida para saber se o e-mail está na lista de autorizados
      this.responseService.getApplications().subscribe({
        next: () => {
          this.loading = false;
          // E-mail autorizado! Redireciona para a tela de estatísticas
          this.router.navigate(['/statistics-binary']);
        },
        error: (err) => {
          this.loading = false;
          this.authService.logout(); // Remove o token temporário
          
          if (err.status === 403) {
            this.errorMessage = 'Acesso negado: o e-mail utilizado não está autorizado para acessar este sistema.';
          } else {
            this.errorMessage = 'Ocorreu um erro ao validar sua autenticação. Tente novamente mais tarde.';
          }
          console.error('Erro de validação de autenticação:', err);
        }
      });
    });
  }
}
