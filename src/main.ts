import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpHeaders, HttpHandler } from '@angular/common/http';


import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, SocialSharing,
    importProvidersFrom(IonicModule.forRoot({}), HttpClient, HttpClientModule, SocialSharing),
    provideRouter(routes),
  ],
});
