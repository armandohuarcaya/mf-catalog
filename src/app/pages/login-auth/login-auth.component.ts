import { CommonModule } from '@angular/common';
import { NbDialogRef } from '@nebular/theme';
import { Component, OnInit, OnDestroy, inject, AfterViewInit, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthGoogleService } from './services/auth-google.service';
import {
  NbCardModule, NbButtonModule, NbInputModule, NbIconModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@Component({
  selector: 'app-login-auth',
  imports: [CommonModule, FormsModule, NbCardModule, NbButtonModule, NbInputModule,
    NbEvaIconsModule, NbIconModule],
  templateUrl: './login-auth.component.html',
  styleUrl: './login-auth.component.scss'
})
export class LoginAuthComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() item: any = '';
  googleAuth = inject(AuthGoogleService);

  /** Paso actual del flujo: selección de método o ingreso de contraseña */
  step = signal<'select' | 'password'>('select');

  /** Email ingresado por el usuario */
  email = '';

  /** Contraseña ingresada por el usuario */
  password = '';

  /** Mensaje de error de login */
  loginError = signal('');

  /** Indica si se está procesando el inicio de sesión */
  isLoggingIn = signal(false);

  constructor(public activeModal: NbDialogRef<LoginAuthComponent>) { }

  ngOnInit(): void { }

  /**
   * Inicializa el botón de Google Sign-In después de que la vista esté lista.
   * Si Google no está disponible, solo muestra una advertencia.
   */
  ngAfterViewInit(): void {
    try {
      this.googleAuth.initialize(this.handleCredentialResponse.bind(this));
      this.googleAuth.renderButton('googleBtn');
    } catch (e) {
      console.warn('Google Auth no disponible', e);
    }
  }

  ngOnDestroy(): void {}

  /** Cierra el modal de login sin acción */
  closeModal(): void {
    this.activeModal.close('close');
  }

  /**
   * Procesa la respuesta de Google Sign-In.
   * Envía el token a la API y, si falla, completa el login con datos locales.
   * @param response Respuesta de Google con el credential JWT
   */
  handleCredentialResponse(response: any): void {
    try {
      this.googleAuth.login$({
        provider: 'GOOGLE',
        idToken: response.credential
      }).subscribe({
        next: (res: any) => {
          console.log('API login GOOGLE ok:', res);
          this.finalizeGoogleLogin(response);
        },
        error: (err: any) => {
          console.warn('API login GOOGLE no disponible, usando datos locales:', err);
          this.finalizeGoogleLogin(response);
        }
      });
    } catch (e) {
      console.warn('Error llamando API GOOGLE, usando datos locales:', e);
      this.finalizeGoogleLogin(response);
    }
  }

  /**
   * Decodifica el JWT de Google y guarda los datos del usuario en sessionStorage.
   * @param response Respuesta de Google con el credential JWT
   */
  private finalizeGoogleLogin(response: any): void {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userData = {
        name: payload.name || payload.given_name || 'Usuario Google',
        email: payload.email || '',
        picture: payload.picture || ''
      };
      sessionStorage.setItem('mf-catalog-user', JSON.stringify(userData));
      this.activeModal.close({ user: userData });
    } catch (e) {
      console.error('Error decodificando token Google:', e);
    }
  }

  /** Inicia el flujo de Google Sign-In (One Tap) */
  loginGoogle(): void {
    try {
      this.googleAuth.prompt();
    } catch (e) {
      console.warn('Error al iniciar Google prompt:', e);
    }
  }

  /**
   * Valida el email ingresado y avanza al paso de contraseña.
   * Muestra error si el email no tiene un formato válido.
   */
  goToPassword(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      this.loginError.set('Ingresa un correo electrónico válido');
      return;
    }
    this.loginError.set('');
    this.step.set('password');
  }

  /** Vuelve al paso de selección y limpia los campos de contraseña */
  goBack(): void {
    this.step.set('select');
    this.password = '';
    this.loginError.set('');
  }

  /**
   * Inicia sesión con email y contraseña (provider LOCAL).
   * Envía credenciales a la API. Si falla, completa el login con datos locales.
   */
  loginWithEmail(): void {
    if (!this.password || this.password.length < 3) {
      this.loginError.set('Ingresa tu contraseña');
      return;
    }

    this.isLoggingIn.set(true);
    this.loginError.set('');

    this.googleAuth.login$({
      provider: 'LOCAL',
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        console.log('API login LOCAL ok:', res);
        this.finalizeEmailLogin();
      },
      error: (err: any) => {
        console.warn('API login LOCAL no disponible, usando datos locales:', err);
        this.finalizeEmailLogin();
      }
    });
  }

  /** Guarda los datos del usuario local en sessionStorage y cierra el modal */
  private finalizeEmailLogin(): void {
    const userData = {
      name: this.email.split('@')[0],
      email: this.email,
      picture: ''
    };
    sessionStorage.setItem('mf-catalog-user', JSON.stringify(userData));
    this.isLoggingIn.set(false);
    this.activeModal.close({ user: userData });
  }
}
