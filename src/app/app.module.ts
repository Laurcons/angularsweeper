import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbButtonModule, NbDialogModule, NbChatModule, NbInputModule, NbToastrModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { AppRoutingModule } from './app-routing.module';
import { SquareGridComponent } from './square-grid/square-grid.component';
import { SquareGridItemComponent } from './square-grid-item/square-grid-item.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SquareGridComponent,
    SquareGridItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
	NbButtonModule,
    NbEvaIconsModule,
	NbDialogModule.forRoot(),
	NbChatModule,
	NbInputModule,
	NbToastrModule.forRoot(),
    AppRoutingModule,
	ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
