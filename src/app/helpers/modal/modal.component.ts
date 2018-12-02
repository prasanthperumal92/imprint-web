import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalConfig, NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal.component.css'],
  providers: [NgbModalConfig, NgbModal]
})
export class ModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Input() title: string;
  @Input() content: string;
  @Input() btnText: string;
  @Output() btnFn = new EventEmitter();  

  public mr: NgbModalRef;

  constructor(config: NgbModalConfig, public modalService: NgbModal) { 
    config.backdrop = 'static';
    config.keyboard = true;    
  }

  ngOnInit() {
  }

  action() {
    this.btnFn.emit();
  }

  close() {
    this.mr.close();    
  }

  open() {    
    this.mr = this.modalService.open(this.modal, {centered: true});
  }
}
