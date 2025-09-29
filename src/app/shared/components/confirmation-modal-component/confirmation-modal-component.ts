import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GenericModalData } from '../../models/modal-options.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './confirmation-modal-component.html',
  styleUrl: './confirmation-modal-component.scss'
})
export class ConfirmationModalComponent {

  @Input() data: GenericModalData = { message: 'probando', buttons: [], title: '' };
  @Input() isVisible: boolean = false;
  @Output() action = new EventEmitter<string>();


  onButtonClick(role: string): void {
    this.action.emit(role);
  }
}
