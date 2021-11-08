import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImageComponent } from './pages/image/image.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';




const routes: Routes = [
  {
    path: '',
    redirectTo: 'image',
    pathMatch: 'full'
  },
  {
    path: 'image',
    component:ImageComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
