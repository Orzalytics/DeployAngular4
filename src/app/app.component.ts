import {Component, OnInit} from '@angular/core';
import {ServiceComponent} from './service/service.component';
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'app';
  user: any;

  constructor( private service: ServiceComponent ) {
    this.service.onUserChanged.subscribe((res) => {
      this.user = res;
    });
  }

  ngOnInit () {

  }
}
