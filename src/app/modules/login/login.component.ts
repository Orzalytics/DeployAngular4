import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ServiceComponent} from '../../service/service.component';
import {Router} from '@angular/router';

let HttpService: any;
let self: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('yukitest2', Validators.required),
    phone: new FormControl('123456', Validators.required),
    rand: new FormControl(Math.floor(1000 + Math.random() * 9000), Validators.required),
  });
  user: any;

  constructor(private service: ServiceComponent, public router: Router) {
    self = this;
    HttpService = this.service;
  }

  ngOnInit() {}

  onSubmit() {
    if (this.loginForm.invalid) {
      return false;
    }

    HttpService.login(this.loginForm.value).subscribe((res) => {
      localStorage.setItem('user', JSON.stringify(res));
      this.service.setSettings(res);
      this.router.navigate(['/']);
    });
  }
}
