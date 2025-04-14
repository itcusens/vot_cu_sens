import { Routes } from '@angular/router';
import { VoteComponent } from './vote/vote.component';
import { SimulateComponent } from './simulate/simulate.component';

export const routes: Routes = [
  { path: '', redirectTo: '/vote', pathMatch: 'full' },
  { path: 'vote', component: VoteComponent },
  { path: 'simulate', component: SimulateComponent }
];
