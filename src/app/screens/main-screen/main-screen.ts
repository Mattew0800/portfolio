import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-screen',
  standalone: true,
  imports: [],
  templateUrl: './main-screen.html',
  styleUrl: './main-screen.scss',
})
export class MainScreen {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
