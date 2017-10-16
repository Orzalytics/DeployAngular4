import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';

// setup simple regex for white listed characters
const validCharacters = /[^\s\w,.:&\/()+%'`@-]/;

// create your class that extends the angular validator class
export class CustomValidators extends Validators {
    static number(control: FormGroup) {
        console.log('Valid number', control);
    }

    // static numberq(prms = {}): ValidatorFn {
        // return (control: FormControl): {[key: string]: string} => {
        //     console.log('tee',(control: FormControl));
            // if(isPresent(Validators.required(control))) {
            //     return null;
            // }
            //
            // let val: number = control.value;
            //
            // if(isNaN(val) || /\D/.test(val.toString())) {
            //
            //     return {"number": true};
            // } else if(!isNaN(prms.min) && !isNaN(prms.max)) {
            //
            //     return val < prms.min || val > prms.max ? {"number": true} : null;
            // } else if(!isNaN(prms.min)) {
            //
            //     return val < prms.min ? {"number": true} : null;
            // } else if(!isNaN(prms.max)) {
            //
            //     return val > prms.max ? {"number": true} : null;
            // } else {
            //
            //     return null;
            // }
        // };
    // }


    // create a static method for your validation
    // static validateCharacters(control: FormControl) {
    //
    //     // first check if the control has a value
    //     if (control.value && control.value.length > 0) {
    //
    //         // match the control value against the regular expression
    //         const matches = control.value.match(validCharacters);
    //
    //         // if there are matches return an object, else return null.
    //         return matches && matches.length ? { invalid_characters: matches } : null;
    //     } else {
    //         return null;
    //     }
    // }
}
