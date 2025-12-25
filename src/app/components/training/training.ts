import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-training',
  imports: [],
  templateUrl: './training.html',
  styleUrl: './training.scss',
})
export class Training {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
