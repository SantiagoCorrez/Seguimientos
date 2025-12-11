import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userName: string = '';

  constructor(public authService: AuthService) {
    console.log(this.authService.isLoggedIn());
    if (this.authService.isLoggedIn()) {
      this.userName = this.authService.getUserName();
    }
  }

}

