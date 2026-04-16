import { Routes } from '@angular/router';

import {CockpitViewerComponent} from './cockpit-viewer/cockpit-viewer';
import {MainScreen} from './screens/main-screen/main-screen';
import {ShipModuleScreen} from './screens/ship-module-screen/ship-module-screen';

import {HomeComponent} from "./components/home-page/home-page";
import {ProjectsPage} from "./components/projects-page/projects-page";
import {SkillsPage} from "./components/skills-page/skills-page";
import {AboutPage} from "./components/about-page/about-page";
import {ContactPage} from "./components/contact-page/contact-page";
import {LogScreen} from "./screens/log-screen/log-screen";

export const routes: Routes = [
  {path: '', component: CockpitViewerComponent},
  {path: 'logs', component: LogScreen},
  {path: 'main', component: MainScreen},
  {path: 'ship-modules', component: ShipModuleScreen},
  {path: 'home', component: HomeComponent},
  {path: 'projects', component: ProjectsPage},
  {path: 'skills', component: SkillsPage},
  {path: 'about', component: AboutPage},
  {path: 'contact', component: ContactPage},




];
