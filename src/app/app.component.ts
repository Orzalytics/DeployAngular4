import { Component, OnInit, ElementRef, AfterViewInit, AfterContentInit } from '@angular/core';
import { ServiceComponent } from './service/service.component';
import { StorageService } from './service/storage.service';

import { DataSource } from '@angular/cdk/collections';

let HttpService: any;
declare const gapi: any;

@Component({
	selector: 'google-signin',
	styleUrls: ['./app.component.css'],
	template: '<button [hidden]="loggedIn" id="googleBtn">Google Sign-In</button>',
	providers: [ServiceComponent]
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
	public loggedIn: boolean;
	
	public googleInit() {
		gapi.load('auth2', () => {
			this.auth2 = gapi.auth2.init({
				client_id: this.clientId,
				cookiepolicy: 'single_host_origin',
				scope: this.scope,
				width: 300
			});
			this.attachSignin(this.element.nativeElement.firstChild);
		});
	}
	
	public attachSignin(element) {
		this.auth2.attachClickHandler(element, {}, (googleUser) => {
			let profile = googleUser.getBasicProfile();
			let token = googleUser.getAuthResponse().id_token;
			HttpService.signIn(token).subscribe( response => {
				// console.log(response);
				if (response.guid) {
					let user = {
						id: profile.Eea,
						name: profile.ig,
						firstName: profile.ofa,
						lastName: profile.wea,
						email: profile.U3,
						imageUrl: profile.Paa
					};
					this.loggedIn = true;
					this.storageService.saveToken(response.guid);
					this.storageService.saveUser(user);
					this.service.setSettings(user);
					location.reload();
				}
			});
				
		}, function (error) {
			console.log(JSON.stringify(error, undefined, 2));
		});
	}

	constructor( private element: ElementRef,
				 private service: ServiceComponent,
				 private storageService: StorageService ) {
	}

	ngOnInit() {
		this.loggedIn = localStorage['userData'] ? true : false;
	}

	ngAfterContentInit() {
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
	googleUser:Object;
	constructor(
		private service: ServiceComponent,
		private storageService: StorageService ) {
		HttpService = this.service;
	}

	ngOnInit() {
		this.googleUser = localStorage['userData'] ? JSON.parse(localStorage['userData']) : null;
	}

	logout() {
		this.googleUser = {};
		this.storageService.removeToken();
		this.storageService.removeUser();
		location.reload();
	}
}
