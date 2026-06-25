import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NbSidebarModule, NbLayoutModule, NbButtonModule, NbMenuModule, NbThemeModule } from '@nebular/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NbLayoutModule, NbThemeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mf-catalog';
}
