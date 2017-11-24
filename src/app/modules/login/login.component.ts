import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ServiceComponent} from '../../service/service.component';

let HttpService: any;
let self: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ ServiceComponent ]
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('yukitest2', Validators.required),
    phone: new FormControl('123456', Validators.required),
    rand: new FormControl(Math.floor(1000 + Math.random() * 9000), Validators.required),
  });

  constructor(private service: ServiceComponent) {
    self = this;
    HttpService = this.service;
  }

  ngOnInit() {
  }

  onSubmit() {
    HttpService.login(this.loginForm.value).subscribe((res) => {
      console.log('Login', res);
    });
  }
}
