import { Injectable } from '@angular/core';
declare const AppleID: any;
@Injectable({
  providedIn: 'root'
})
export class AuthAppleService {

  clientId = 'com.tuapp.web';
  redirectURI = 'http://localhost:4200/auth/apple/callback';

  init() {
    AppleID.auth.init({
      clientId: this.clientId,
      scope: 'name email',
      redirectURI: this.redirectURI,
      state: 'app-state',
      usePopup: true
    });
  }

  async signIn() {
    return await AppleID.auth.signIn();
  }
}
