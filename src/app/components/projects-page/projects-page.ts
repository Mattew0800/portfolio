import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleStateService } from '../../services/module-state.service';

@Component({
  selector: 'app-projects-page',
  imports: [],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
})
export class ProjectsPage implements OnInit {
  constructor(
    private moduleStateService: ModuleStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moduleStateService.setVisitedModule(2); // MODULO 2
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
