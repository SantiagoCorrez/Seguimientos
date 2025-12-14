import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, HeaderComponent],
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css']
})
export class UserAdminComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  secretarias: any[] = [];
  selectedUser: any = {};
  isEditMode = false;

  viewMode: 'list' | 'form' = 'list';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadSecretarias();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(data => {
      this.roles = data;
    });
  }

  loadSecretarias(): void {
    this.userService.getSecretarias().subscribe(data => {
      this.secretarias = data;
    });
  }

  originalRoles: string[] = [];

  onSelectUser(user: any): void {
    this.selectedUser = { ...user };
    // Ensure roles is initialized
    if (!this.selectedUser.roles) {
      this.selectedUser.roles = [];
    }
    this.originalRoles = [...this.selectedUser.roles];
    this.isEditMode = true;
    this.viewMode = 'form';
  }

  onNewUser(): void {
    this.selectedUser = {
      nombre: '',
      email: '',
      password: '',
      secretaria_id: null,
      roles: []
    };
    this.isEditMode = false;
    this.viewMode = 'form';
  }

  onCancel(): void {
    this.viewMode = 'list';
    this.selectedUser = {};
  }

  onSaveUser(): void {
    if (this.isEditMode) {
      // 1. Update User Basic Info
      this.userService.updateUser(this.selectedUser.id, this.selectedUser).pipe(
        switchMap(() => {
          // 2. Calculate Role Changes
          const currentRoles = this.selectedUser.roles || [];
          const rolesToAdd = currentRoles.filter((r: string) => !this.originalRoles.includes(r));
          const rolesToRemove = this.originalRoles.filter((r: string) => !currentRoles.includes(r));

          const requests: any = [];

          // Add Roles
          rolesToAdd.forEach((roleName: string) => {
            const roleId = this.getRoleId(roleName);
            if (roleId) {
              requests.push(this.userService.assignRole(this.selectedUser.id, roleId));
            }
          });

          // Remove Roles
          rolesToRemove.forEach((roleName: string) => {
            const roleId = this.getRoleId(roleName);
            if (roleId) {
              requests.push(this.userService.removeRole(this.selectedUser.id, roleId));
            }
          });

          return requests.length > 0 ? forkJoin(requests) : of([]);
        })
      ).subscribe({
        next: () => {
          this.loadUsers();
          this.viewMode = 'list';
        },
        error: (err) => {
          console.error('Error updating user or roles:', err);
          // Handle error (optional: show notification)
        }
      });

    } else {
      // Create User
      this.userService.createUser(this.selectedUser).pipe(
        switchMap((newUser: any) => {
          const requests: any = [];
          if (this.selectedUser.roles && this.selectedUser.roles.length > 0) {
            this.selectedUser.roles.forEach((roleName: string) => {
              const roleId = this.getRoleId(roleName);
              if (roleId) {
                // Use the ID from the newly created user
                requests.push(this.userService.assignRole(newUser.id, roleId));
              }
            });
          }
          return requests.length > 0 ? forkJoin(requests) : of([]);
        })
      ).subscribe({
        next: () => {
          this.loadUsers();
          this.viewMode = 'list';
        },
        error: (err) => {
          console.error('Error creating user or assigning roles:', err);
        }
      });
    }
  }

  getRoleId(roleName: string): number | null {
    const role = this.roles.find(r => r.nombre === roleName);
    return role ? role.id : null;
  }

  toggleRole(roleName: string): void {
    if (!this.selectedUser.roles) {
      this.selectedUser.roles = [];
    }
    const index = this.selectedUser.roles.indexOf(roleName);
    if (index > -1) {
      this.selectedUser.roles.splice(index, 1);
    } else {
      this.selectedUser.roles.push(roleName);
    }
  }
  onDeleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }
}
