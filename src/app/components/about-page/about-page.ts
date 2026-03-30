import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleStateService } from '../../services/module-state.service';

@Component({
  selector: 'app-about-page',
  imports: [],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage implements OnInit {
  constructor(
    private moduleStateService: ModuleStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moduleStateService.setVisitedModule(4); // MODULO 4
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
