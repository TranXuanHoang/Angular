import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isAuthenticating = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    this.isAuthenticating = true;
    const email = authForm.value.email;
    const password = authForm.value.password;

    if (this.isLoginMode) {
      // TODO
    } else {
      this.authService.signup(email, password).subscribe(
        authResponse => {
          console.log(authResponse);
          this.isAuthenticating = false;
        },
        authError => {
          console.log(authError);
          this.isAuthenticating = false;
        }
      );
    }
    authForm.reset();
  }

}
