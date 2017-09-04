import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule, MdCardModule, MdMenuModule, MdToolbarModule, MdIconModule, MdInputModule, MdSliderModule, MdGridListModule, MdSelectModule } from '@angular/material';
import { ServiceComponent } from './service/service.component';

// Directives
import { D3ScatterPlot } from './d3scatter/d3scatter-directive';
import { D3FundLine } from './d3FundLine/d3fundline-directive';
import { D3PortLine } from './d3PortLine/d3portline-directive';
import { D3TreeMap } from './d3TreeMap/d3treemap-directive';

const appRoutes: Routes = [
  { path:'', component: HomeComponent },
  { path:'login', component: LoginComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    D3ScatterPlot,
    D3FundLine,
    D3PortLine,
    D3TreeMap
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    
    BrowserAnimationsModule,
    MdButtonModule,
    MdMenuModule,
    MdCardModule,
    MdToolbarModule,
    MdIconModule,
    MdInputModule,
    MdSliderModule,
    MdGridListModule,
    MdSelectModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }