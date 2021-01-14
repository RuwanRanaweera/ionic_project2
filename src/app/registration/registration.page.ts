import { Component, OnInit } from '@angular/core';
import {  FormControl, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  form: FormGroup;
  constructor( ) { }

  ngOnInit() {
    this.form = new FormGroup(
      {
        first: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        last: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        phone: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required, Validators.min(1)]
        })
        ,
        email: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        user: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        password: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required, Validators.minLength(6)]
        })
      });
  }

  // onSubmit(form: NgForm) {
  //   if (!form.valid) {
  //     return;
  //   }
  //   const first = form.value.first;
  //   const last = form.value.last;
  //   const phone = form.value.phone;
  //   const email = form.value.email;
  //   const user = form.value.user;
  //   const password = form.value.password;
  //   console.log(first, last, phone, email, user, password);
  // }

  onCreateGem() {
    if (!this.form.valid) {
      return;
    }
    console.log(this.form);
  }
}
