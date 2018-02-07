import { Component, OnInit, ElementRef, AfterViewInit, AfterContentInit } from '@angular/core';
import { ServiceComponent } from './service/service.component';
import { DataSource } from '@angular/cdk/collections';

let HttpService: any;
declare const gapi: any;

@Component({
	selector: 'google-signin',
  styleUrls: ['./app.component.css'],
  template: '<button id="googleBtn">Google Sign-In</button>'
})

export class GoogleSigninComponent implements AfterContentInit {

	private clientId:string = '466781828593-brtt5d4pmvanj8h3dp39trcd08ihlvuf.apps.googleusercontent.com';
	
	private scope = [
		'profile',
		'email',
		'https://www.googleapis.com/auth/plus.me',
		'https://www.googleapis.com/auth/contacts.readonly',
		'https://www.googleapis.com/auth/admin.directory.user.readonly'
	].join(' ');

	public auth2: any;
	
	public googleInit() {
		gapi.load('auth2', () => {
			this.auth2 = gapi.auth2.init({
				client_id: this.clientId,
				cookiepolicy: 'single_host_origin',
				scope: this.scope,
				width: 300
			});
			console.log(this.element.nativeElement);
			this.attachSignin(this.element.nativeElement.firstChild);
		});
	}
	
	public attachSignin(element) {
		this.auth2.attachClickHandler(element, {}, (googleUser) => {
			let profile = googleUser.getBasicProfile();
			let token = googleUser.getAuthResponse().id_token;
			HttpService.signIn(token).subscribe( response => {
				console.log(response);
				if (response.guid) {
					let user = {
						id: profile.Eea,
						name: profile.ig,
						firstName: profile.ofa,
						lastName: profile.wea,
						email: profile.U3,
						imageUrl: profile.Paa
					};
					this.saveToken(response.guid);
					this.saveUser(user);
				}
			});
				
		}, function (error) {
			console.log(JSON.stringify(error, undefined, 2));
		});
	}

	public saveToken(token) {
		localStorage['userToken'] = token;
	}

	public getToken() {
		return localStorage['userToken'];
	}

	public removeToken() {
		localStorage.removeItem('userToken');
	}

	public saveUser(user) {
		localStorage['userData'] = JSON.stringify(user);
	}

	public getUser() {
		return JSON.parse(localStorage['userData']);
	}

	public removeUser() {
		localStorage.removeItem('userData');
	}

	constructor(private element: ElementRef) {
		console.log('ElementRef: ', this.element);
	}

	ngAfterContentInit() {
		console.log('ngAfterContentInit');
		setTimeout(() => {
			this.googleInit();
		}, 500);

	}
}


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [ServiceComponent]
})

export class AppComponent implements OnInit {
	title = 'app';
	googleUser = localStorage['userData'] ? JSON.parse(localStorage['userData']) : null;
	constructor(
		private service: ServiceComponent ) {
		HttpService = this.service;
	}

	ngOnInit() {
		console.log(this.googleUser);
	}
}
