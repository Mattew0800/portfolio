import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'portfolio.language';
  readonly currentLanguage = signal<AppLanguage | null>(null);

  constructor(private readonly translateService: TranslateService) {
    this.translateService.addLangs(['es', 'en']);
    this.translateService.setFallbackLang('en');

    const savedLanguage = this.getSavedLanguage();
    if (savedLanguage) {
      this.applyLanguage(savedLanguage, false);
    }
  }

  selectLanguage(language: AppLanguage): void {
    this.applyLanguage(language, true);
  }

  private applyLanguage(language: AppLanguage, persist: boolean): void {
    this.translateService.use(language);
    this.currentLanguage.set(language);

    if (persist) {
      localStorage.setItem(this.storageKey, language);
    }
  }

  private getSavedLanguage(): AppLanguage | null {
    const savedLanguage = localStorage.getItem(this.storageKey);
    return savedLanguage === 'es' || savedLanguage === 'en' ? savedLanguage : null;
  }
}
