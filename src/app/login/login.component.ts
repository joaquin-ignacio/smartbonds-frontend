import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {User} from "../interfaces/user";
import {Auth} from "../interfaces/authinterface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userInput: User;
  isSubmitted: boolean = false;
  login: Auth;
  user: any;

  loginForm: FormGroup = this.formBuilder.group({
    username: ['', {validators: [Validators.required], updateOn: 'change'}],
    password: ['', {validators: [Validators.required], updateOn: 'change'}]
  })
  constructor(private route:Router, private formBuilder: FormBuilder, private userService: UserService) {
    this.userInput = {} as User;
    this.user = {} as User;
    this.login = {} as Auth;
  }

  ngOnInit(): void {
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submittedForm() {
    this.isSubmitted = true;
  }

  handleLogin() {
    this.userService.login(this.login).subscribe(data => {
      this.user = data;
      if(this.user.password == this.login.password) {
        sessionStorage.setItem('currentUser', JSON.stringify(this.user));
        return this.route.navigateByUrl('/calculator')
      } else {
        return this.route.navigateByUrl('/login')
      }
    }, error => {
      window.alert("Credenciales incorrectas");
    });
  }

  navigateToRegister():void {
    this.route.navigateByUrl('/register');
  }
}
