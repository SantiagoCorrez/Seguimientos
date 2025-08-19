import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule,ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm:FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  })

  constructor(private router:Router) {}

  onSubmit() {
    const { username, password } = this.loginForm.value;
    // Aquí puedes agregar la lógica para autenticar al usuario
    console.log('Usuario:', username, 'Contraseña:', password);

    this.router.navigate(['/home']);
    
  }
}
