import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AlertComponent} from './alert.component'
import {AlertService} from './alert.service'

@NgModule({
    imports:[CommonModule,FormsModule, ReactiveFormsModule],
    declarations:[AlertComponent],
    providers:[AlertService],
    exports:[AlertComponent],
})

export class AlertModule{}