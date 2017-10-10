import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Input,
    OnInit
} from '@angular/core';

@Component({
    selector: 'app-custom-select-field',
    templateUrl: './custom.select.field.html',
    styleUrls: ['./custom.select.field.css']
})

export class CustomSelectComponent implements OnInit, AfterViewChecked {
    @Input('dataSelected') dataSelected: string;
    @Input('dataList') dataList: string;
    public width: number = 0;
    public selectElement: any;

    constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
        this.selectElement = el.nativeElement;
    }

    ngOnInit() {}

    ngAfterViewChecked() {
        if(this.selectElement.querySelector('.mat-select-value-text span')) {
            this.width = this.selectElement.querySelector('.mat-select-value-text span').offsetWidth + 22;
            this.cdr.detectChanges();
        }
    }
}
