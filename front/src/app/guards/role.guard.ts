import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const expectedRoles = next.data['roles'] as Array<string>;
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    const userRoles = this.authService.getRoles();
    const hasRole = expectedRoles.some(role => userRoles.includes(role));

    if (this.authService.isLoggedIn() && hasRole) {
      return true;
    } else {
      this.router.navigate(['/home']); // o a una página de acceso denegado
      return false;
    }
  }
}
