import {Component, OnInit} from '@angular/core';
import {ModuleStateService} from "../../services/module-state.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-log-screen',
  imports: [],
  templateUrl: './log-screen.html',
  styleUrl: './log-screen.scss',
})
export class LogScreen{

    constructor(
        private router: Router
    ) {}

    goBack(): void {
        this.router.navigate(['/']);
    }

}
