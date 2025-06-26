import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
open = false;
private timeoutId: any;
 constructor(public translation: TranslationService){

 }

   toggleLang() {
    this.translation.toggleLanguage();
  }

onMouseEnter() {
  clearTimeout(this.timeoutId);
  this.open = true;
}

onMouseLeave() {
  this.timeoutId = setTimeout(() => {
    this.open = false;
  }, 200); // مهلة صغيرة قبل الإغلاق
}

}
