import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { NbThemeModule, NbLayoutModule, NbSidebarModule, NbMenuModule, NbDialogModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es-PE';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideAnimationsAsync('noop'), provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'light' }), // ! dark, light
      NbSidebarModule.forRoot(),
      NbMenuModule.forRoot(),
      NbDialogModule.forRoot(),
    )
]
};
