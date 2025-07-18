import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-permission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './no-permission.component.html',
  styleUrls: ['./no-permission.component.scss'],
})
export class NoPermissionComponent {
  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
