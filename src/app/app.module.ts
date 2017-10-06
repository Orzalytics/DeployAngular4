import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import {TradeComponent} from './trade/trade.component';
// import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MdButtonModule, MdCardModule, MdMenuModule, MdToolbarModule, MdIconModule, MdInputModule, MdSliderModule,
  MdGridListModule, MdSelectModule, MdDatepickerModule, MdNativeDateModule
} from '@angular/material';
import { ServiceComponent } from './service/service.component';

// Directives
import { D3ScatterPlot } from './d3scatter/d3scatter-directive';
import { D3FanchartDirective } from './d3FanChart/d3fanchart-directive';
import { D3FundLine } from './d3FundLine/d3fundline-directive';
import { D3PortLine } from './d3PortLine/d3portline-directive';
import { D3TreeMap } from './d3TreeMap/d3treemap-directive';
import {FlexLayoutModule} from '@angular/flex-layout';

const appRoutes: Routes = [
  { path:'', component: HomeComponent },
  { path:'trade', component: TradeComponent },
  { path:'login', component: LoginComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    TradeComponent,
    D3ScatterPlot,
    D3FanchartDirective,
    D3FundLine,
    D3PortLine,
    D3TreeMap
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    FlexLayoutModule,

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
    MdDatepickerModule,
    MdNativeDateModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
