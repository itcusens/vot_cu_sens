import { Routes } from '@angular/router';
import { VoteComponent } from './vote/vote.component';
import { SimulateComponent } from './simulate/simulate.component';
import { VotelistComponent } from './votelist/votelist.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';

export const routes: Routes = [
  { path: '', redirectTo: '/list', pathMatch: 'full' },
  { path: 'list', component: VotelistComponent },
  { path: 'vote', component: VoteComponent },
  { path: 'simulate', component: SimulateComponent },
  { path: 'scan', component: QrScannerComponent}
];
