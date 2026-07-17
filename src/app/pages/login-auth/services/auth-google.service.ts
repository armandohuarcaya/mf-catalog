import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
declare const google: any;
@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {
  api:any = {
    auth: `${environment.auth}`
  };

  private clientId = '366222796120-ahh75ntaa4hfk2tncseehjvl1u9ooicc.apps.googleusercontent.com';
  constructor(private httpClient: HttpClient) { }

  initialize(callback: (response: any) => void) {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: callback
    });
  }

  renderButton(elementId: string) {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: 250
      }
    );
  }

  prompt() {
    google.accounts.id.prompt(); // popup automático
  }
  login$(params: any) {
    return this.httpClient.post(`${this.api.auth}/login`, params);
  }
}
