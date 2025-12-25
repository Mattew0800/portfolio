import { Routes } from '@angular/router';

import {CockpitViewerComponent} from './cockpit-viewer/cockpit-viewer';
import {LogScreen} from './screens/log-screen/log-screen';
import {MainScreen} from './screens/main-screen/main-screen';
import {ShipModuleScreen} from './screens/ship-module-screen/ship-module-screen';
import {Projects} from './components/projects/projects';
import {Education} from './components/education/education';
import {Training} from './components/training/training';

export const routes: Routes = [
  {path: '', component: CockpitViewerComponent},
  {path: 'logs', component: LogScreen},
  {path: 'ship-modules', component: ShipModuleScreen},
  {path: 'main', component: MainScreen},
  {path: 'projects', component: Projects},
  {path: 'education', component: Education},
  {path: 'training', component: Training}
];
