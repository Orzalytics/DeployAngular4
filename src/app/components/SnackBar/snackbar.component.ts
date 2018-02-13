import { Component, Inject } from '@angular/core';
import { MD_SNACK_BAR_DATA } from '@angular/material';

@Component({
  selector   : 'app-snackbar',
  templateUrl: 'snackbar.component.html',
  styleUrls  : ['snackbar.component.css']
})
export class SnackBarComponent {
  constructor( @Inject(MD_SNACK_BAR_DATA) public data: any ) { }
}
