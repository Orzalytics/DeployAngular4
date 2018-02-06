import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MdButtonModule, MdCardModule, MdMenuModule, MdToolbarModule, MdIconModule, MdInputModule, MdSliderModule,
  MdGridListModule, MdSelectModule, MdDatepickerModule, MdNativeDateModule, MdSidenavModule, MdListModule
} from '@angular/material';

// Services
import { ResizeService } from './service/resize.service';

// Components
import { AppComponent, GoogleSigninComponent } from './app.component';
import { LoginComponent } from './modules/login/login.component';
import { HomeComponent } from './modules/home/home.component';
import { TradeComponent } from './modules/trade/trade.component';
import { ManagementComponent } from './modules/management/management.component';

// import { ServiceComponent } from './service/service.component';

// Directives
import { D3ScatterPlot } from './components/d3/d3scatter/d3scatter-directive';
import { D3FanchartDirective } from './components/d3/d3FanChart/d3fanchart-directive';
import { D3FundLine } from './components/d3/d3FundLine/d3fundline-directive';
import { D3PortLine } from './components/d3/d3PortLine/d3portline-directive';
import { D3TreeMap } from './components/d3/d3TreeMap/d3treemap-directive';
import { D3PortHisogram } from './components/d3/d3PortHisogram/d3porthisogram-directive';
import { CustomSelectComponent } from './components/CustomSelectField/custom.select.field';
import { D3ScatterPlotCompare } from './components/d3/d3ScatterCompare/d3scattercompare-directive';
import {TextMaskModule} from "angular2-text-mask";

// Libraries
import { OwlModule } from 'ngx-owl-carousel';
import { ServiceComponent } from './service/service.component';

const appRoutes: Routes = [
  { path:'', component: HomeComponent },
  { path:'trade', component: TradeComponent },
  { path:'management', component: ManagementComponent },
  { path:'login', component: LoginComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    GoogleSigninComponent,
    LoginComponent,
    HomeComponent,
    TradeComponent,
    ManagementComponent,
    D3ScatterPlot,
    D3FanchartDirective,
    D3FundLine,
    D3PortLine,
    D3TreeMap,
    D3PortHisogram,
    CustomSelectComponent,
    D3ScatterPlotCompare,
  ],

  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    TextMaskModule,
    FlexLayoutModule,

    OwlModule,
    // SocialLoginModule,

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
    MdListModule,

    RouterModule.forRoot(appRoutes)
  ],

  providers: [
    ResizeService,
    ServiceComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
