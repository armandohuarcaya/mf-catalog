import { Injectable } from '@angular/core';
declare const google: any;
@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {

  private clientId = '366222796120-ahh75ntaa4hfk2tncseehjvl1u9ooicc.apps.googleusercontent.com';

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
}
