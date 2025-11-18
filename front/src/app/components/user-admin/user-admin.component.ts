import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  onSelectUser(user: any): void {
    this.selectedUser = { ...user };
    this.isEditMode = true;
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
  }

  onSaveUser(): void {
    if (this.isEditMode) {
      this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe(() => {
        this.loadUsers();
      });
    } else {
      this.userService.createUser(this.selectedUser).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  onDeleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
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
}
