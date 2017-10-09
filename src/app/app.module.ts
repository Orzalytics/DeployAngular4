import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './modules/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import {TradeComponent} from './modules/trade/trade.component';
// import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MdButtonModule, MdCardModule, MdMenuModule, MdToolbarModule, MdIconModule, MdInputModule, MdSliderModule,
  MdGridListModule, MdSelectModule, MdDatepickerModule, MdNativeDateModule, MdSidenavModule
} from '@angular/material';
import { ServiceComponent } from './service/service.component';

// Directives
import { D3ScatterPlot } from './components/d3/d3scatter/d3scatter-directive';
import { D3FanchartDirective } from './components/d3/d3FanChart/d3fanchart-directive';
import { D3FundLine } from './components/d3/d3FundLine/d3fundline-directive';
import { D3PortLine } from './components/d3/d3PortLine/d3portline-directive';
import { D3TreeMap } from './components/d3/d3TreeMap/d3treemap-directive';
import {FlexLayoutModule} from '@angular/flex-layout';
import { D3PortHisogram } from './components/d3/d3PortHisogram/d3porthisogram-directive';

const appRoutes: Routes = [
  { path:'', component: HomeComponent },
  { path:'trade/:name', component: TradeComponent },
  { path:'login', component: LoginComponent }
];

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
    D3TreeMap,
    D3PortHisogram
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
    MdSidenavModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    // MdSidenavModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
