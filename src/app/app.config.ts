import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import {  HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
     provideHttpClient(
      withFetch(),
      withInterceptors([apiKeyInterceptor,authInterceptor]) 
    ),
    provideAnimations(), 
    importProvidersFrom(
      BrowserAnimationsModule, 
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      NgxSpinnerModule.forRoot({
        type: 'ball-spin-clockwise-fade-rotating'
      }),
      ToastrModule.forRoot({
        positionClass: 'toast-top-right', 
        timeOut: 3000,
        progressBar: true,
        progressAnimation: 'increasing',
        closeButton: true,
        enableHtml: true,
        preventDuplicates: true
      })
    )
  ]
};
