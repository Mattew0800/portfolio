import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleStateService } from '../../services/module-state.service';

@Component({
  selector: 'app-contact-page',
  imports: [],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
})
export class ContactPage implements OnInit {
  constructor(
    private moduleStateService: ModuleStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moduleStateService.setVisitedModule(5); // MODULO 5
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
