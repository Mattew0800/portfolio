import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-screen',
  standalone: true,
  imports: [],
  templateUrl: './log-screen.html',
  styleUrl: './log-screen.scss',
})
export class LogScreen {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
