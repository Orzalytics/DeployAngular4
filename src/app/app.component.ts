import { Component, OnInit } from '@angular/core';
import { ServiceComponent } from './service/service.component';
import { DataSource } from '@angular/cdk/collections';

import { AuthService, SocialUser, GoogleLoginProvider } from 'angular4-social-login';

let HttpService: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ServiceComponent]
})

export class AppComponent implements OnInit {
  title = 'app';
  user: any;
  googleUser: SocialUser;
  googleUserName: string;

  constructor(
    private service: ServiceComponent,
    private authService: AuthService ) {
    this.service.onUserChanged.subscribe((res) => {
      this.user = res;
    });
    HttpService = this.service;
  }

  ngOnInit() {
    this.authService.authState.subscribe((googleUser) => {
      this.googleUser = googleUser;
      if (googleUser) {
        if (!googleUser.name && (googleUser.firstName || googleUser.lastName)) {
          this.googleUserName = (googleUser.firstName || '') + (googleUser.lastName || '');
        } else {
          this.googleUserName = googleUser.name;
        }
      }
      this.checkAndStoreUser(googleUser);
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }

  logout() {
    localStorage.removeItem('user');
    this.service.setSettings({'user': ''});
  }

  checkAndStoreUser(user) {
      if (user) {
            HttpService.signIn(user).subscribe(
                response => {
                  console.log(response);
            });
        }
  };


}
