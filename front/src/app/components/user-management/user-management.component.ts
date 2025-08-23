import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe(data => {
      this.roles = data;
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  updateUser(user: any): void {
    // Logic to update user details (e.g., open a modal with a form)
    console.log('Updating user:', user);
  }

  assignRole(user: any, roleId: string): void {
    this.userService.assignRole(user.id, parseInt(roleId, 10)).subscribe(() => {
      this.loadUsers(); // Recargar la lista de usuarios
    });
  }

  removeRole(user: any, roleName: string): void {
    const role = this.roles.find(r => r.nombre === roleName);
    if (role) {
      this.userService.removeRole(user.id, role.id).subscribe(() => {
        this.loadUsers(); // Recargar la lista de usuarios
      });
    }
  }
}
