import { Component, OnInit } from '@angular/core';
import {User} from "../interfaces/user";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  isSubmitted: boolean = false;
  userCreated: User;
  registerForm: FormGroup = this.formBuilder.group({
    name: ['',{validators:[Validators.required, Validators.minLength(4)], updateOn: 'change'}],
    username: ['', {validators: [Validators.required, Validators.minLength(6), Validators.maxLength(25)], updateOn: 'change'}],
    password: ['', {validators: [Validators.required, Validators.minLength(6), Validators.maxLength(15)], updatedOn: 'change'}]
  });

  constructor(private routes: Router, private formBuilder: FormBuilder, private userService:UserService) {
    this.userCreated = {} as User;
  }

  ngOnInit(): void {
  }

  get name() {
    return this.registerForm.get('name');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password')
  }

  submittedForm() {
    this.isSubmitted = true;
  }

  registerUser() {
    this.userService.register(this.userCreated).subscribe(data => {
      this.routes.navigateByUrl('/login');
    }, error => {
      window.alert('Algo salió mal en el registro.');
    })
  }

  getBack() {
    this.routes.navigateByUrl('/login');
  }

}
