import { CommonModule } from '@angular/common';
import { NbDialogRef } from '@nebular/theme';
import { Component, OnInit, inject, AfterViewInit, Input } from '@angular/core';
import { AuthGoogleService } from './services/auth-google.service';
import {
  NbCardModule, NbButtonModule, NbInputModule, NbIconModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { AuthAppleService } from './services/auth-apple.service';
@Component({
  selector: 'app-login-auth',
  imports: [CommonModule, NbCardModule, NbButtonModule, NbInputModule,
    NbEvaIconsModule,  NbIconModule,],
  templateUrl: './login-auth.component.html',
  styleUrl: './login-auth.component.scss'
})
export class LoginAuthComponent  implements OnInit, AfterViewInit {
  @Input() item:any = '';
  googleAuth = inject(AuthGoogleService);
  appleAuth = inject(AuthAppleService);
  constructor(public activeModal: NbDialogRef<LoginAuthComponent>) {}
  ngAfterViewInit() {
    this.googleAuth.initialize(this.handleCredentialResponse.bind(this));

    // opcional: mostrar botón oficial de Google
    this.googleAuth.renderButton('googleBtn');

    this.appleAuth.init();
  }
  ngOnInit(): void {
  }
  closeModal() {
    this.activeModal.close('close');
  }
  handleCredentialResponse(response: any) {
    console.log('TOKEN GOOGLE:', response.credential);

    // aquí decodificas el JWT si quieres:
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log('USER:', payload);

    // payload.sub -> id
    // payload.email
    // payload.name
  }

  loginGoogle() {
    this.googleAuth.prompt();
  }


  // apple

  async loginApple() {
    const response = await this.appleAuth.signIn();

    console.log('APPLE RAW RESPONSE:', response);

    const id_token = response.authorization.id_token;

    // decodificar JWT
    const payload = JSON.parse(atob(id_token.split('.')[1]));

    console.log('USER APPLE:', payload);

    // guardar sesión
    localStorage.setItem('user', JSON.stringify(payload));
  }
}
