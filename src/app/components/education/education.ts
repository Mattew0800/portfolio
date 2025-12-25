import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-education',
  imports: [],
  templateUrl: './education.html',
  styleUrl: './education.scss',
})
export class Education {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
