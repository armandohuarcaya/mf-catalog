import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {
  api: any = {
    auth: `${environment.auth}`
  };

  private clientId = '366222796120-ahh75ntaa4hfk2tncseehjvl1u9ooicc.apps.googleusercontent.com';

  constructor(private httpClient: HttpClient) { }

  /**
   * Inicializa Google Sign-In con el callback para recibir el credential JWT.
   * @param callback Función que recibe la respuesta de Google (objeto con credential)
   */
  initialize(callback: (response: any) => void): void {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback
    });
  }

  /**
   * Renderiza el botón oficial de Google Sign-In en el elemento indicado.
   * @param elementId ID del elemento DOM donde se renderizará el botón
   */
  renderButton(elementId: string): void {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      { theme: 'outline', size: 'large', width: 250 }
    );
  }

  /** Muestra el One Tap de Google (popup automático) */
  prompt(): void {
    google.accounts.id.prompt();
  }

  /**
   * Envía una solicitud de login a la API de autenticación.
   * Acepta tanto provider LOCAL (email+password) como GOOGLE (idToken).
   * @param params { provider: 'LOCAL' | 'GOOGLE', email?, password?, idToken? }
   * @returns Observable con la respuesta de la API
   */
  login$(params: any) {
    return this.httpClient.post(`${this.api.auth}/login`, params);
  }
}
