import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  newUser = { nombre: '', email: '', password: '' };
  addUserError: string = '';
  addUserSuccess: boolean = false;
  editUserId: number | null = null;
  editUserData: { nombre: string; email: string; password: string } = { nombre: '', email: '', password: '' };
  editUserError: string = '';

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

  addUser(): void {
    this.addUserError = '';
    this.addUserSuccess = false;
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.addUserSuccess = true;
        this.newUser = { nombre: '', email: '', password: '' };
        this.loadUsers();
        this.editUserId = null;
        this.editUserData = { nombre: '', email: '', password: '' };
        this.editUserError = '';
      },
      error: (err) => {
        this.addUserError = err.error?.error || 'Error al añadir usuario.';
      }
    });
  }
  editUser(user: any): void {
    this.editUserId = user.id;
    this.editUserData = { nombre: user.nombre, email: user.email, password: '' };
    this.editUserError = '';
  }

  cancelEditUser(): void {
    this.editUserId = null;
    this.editUserData = { nombre: '', email: '', password: '' };
    this.editUserError = '';
  }

  saveEditUser(user: any): void {
    this.editUserError = '';
    const data: any = {
      nombre: this.editUserData.nombre,
      email: this.editUserData.email
    };
    if (this.editUserData.password) {
      data.password = this.editUserData.password;
    }
    this.userService.updateUser(user.id, data).subscribe({
      next: () => {
        this.editUserId = null;
        this.editUserData = { nombre: '', email: '', password: '' };
        this.loadUsers();
      },
      error: (err) => {
        this.editUserError = err.error?.error || 'Error al editar usuario.';
      }
    });
  }

  deleteUser(user: any): void {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          alert(err.error?.error || 'Error al eliminar usuario.');
        }
      });
    }
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
