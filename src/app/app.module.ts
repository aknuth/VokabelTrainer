import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NzFooterComponent, NzHeaderComponent, NzLayoutModule, NzSiderComponent } from 'ng-zorro-antd/layout';
// NG Translate
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);
/** config ng-zorro-antd i18n **/
import { NZ_I18N, de_DE } from 'ng-zorro-antd/i18n';
import { AppComponent } from './pages/root/app.component';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { CropperComponent } from './components/cropper/cropper.component';
import { ImageComponent } from './pages/image/image.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@NgModule({
  declarations: [AppComponent, PageNotFoundComponent, ImageComponent,  CropperComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    FontAwesomeModule,
    NzImageModule,
    NzStepsModule,
    NzProgressModule
  ],
  providers: [{provide: NZ_I18N, useValue: de_DE}],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, fab, far);
  }  
}
