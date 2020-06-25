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
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    this.isLoading = true;
    this.error = null;
    const email = authForm.value.email;
    const password = authForm.value.password;

    if (this.isLoginMode) {
      // TODO
    } else {
      this.authService.signup(email, password).subscribe(
        authResponse => {
          console.log(authResponse);
          this.isLoading = false;
        },
        errorMsg => {
          this.error = errorMsg;
          this.isLoading = false;
        }
      );
    }
    authForm.reset();
  }

}
