import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ship-module-screen',
  standalone: true,
  imports: [],
  templateUrl: './ship-module-screen.html',
  styleUrl: './ship-module-screen.scss',
})
export class ShipModuleScreen {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
