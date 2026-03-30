import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleStateService } from '../../services/module-state.service';

@Component({
  selector: 'app-skills-page',
  imports: [],
  templateUrl: './skills-page.html',
  styleUrl: './skills-page.scss',
})
export class SkillsPage implements OnInit {
  constructor(
    private moduleStateService: ModuleStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moduleStateService.setVisitedModule(3); // MODULO 3
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
