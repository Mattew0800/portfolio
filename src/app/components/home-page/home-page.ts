import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleStateService } from '../../services/module-state.service';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  constructor(
    private moduleStateService: ModuleStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moduleStateService.setVisitedModule(1); // MODULO 1
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
