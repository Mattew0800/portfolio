import { Routes } from '@angular/router';

import {CockpitViewerComponent} from './cockpit-viewer/cockpit-viewer';
import {MainScreen} from './screens/main-screen/main-screen';
import {HomeComponent} from "./components/home-page/home-page";

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'main', component: MainScreen},
  {path: 'cockpit', component: CockpitViewerComponent},
];
