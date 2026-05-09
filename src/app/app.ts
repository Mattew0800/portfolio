import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AppLanguage, LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentLanguage = this.languageService.currentLanguage;
  protected readonly showLanguageModal = computed(() => this.currentLanguage() === null);

  constructor(private readonly languageService: LanguageService) {}

  protected selectLanguage(language: AppLanguage): void {
    this.languageService.selectLanguage(language);
  }
}
