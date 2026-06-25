import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbCardModule, NbButtonModule, NbInputModule, NbIconModule, NbTabsetModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { NgbCarouselConfig, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-m-catalog-detail',
  imports: [CommonModule, NbCardModule, NbButtonModule, NbInputModule,
    NbEvaIconsModule,  NbIconModule, NgbCarouselModule, NgbModule, NbTabsetModule],
  templateUrl: './m-catalog-detail.component.html',
  styleUrl: './m-catalog-detail.component.scss',
  providers: [NgbCarouselConfig]
})
export class MCatalogDetailComponent implements OnInit{
  @Input() item:any = '';
  // images = [700, 800, 807].map((n) => `https://picsum.photos/id/${n}/900/500`);
  constructor(public activeModal: NbDialogRef<MCatalogDetailComponent>, config: NgbCarouselConfig) {
    config.interval = 3000;
    // config.keyboard = true;
    // config.pauseOnHover = true;
    config.wrap = true;
		config.keyboard = true;
		config.pauseOnHover = true;
  }
  ngOnInit(): void {
    this.item.images = [this.item.images]
    console.log(this.item);
  }
  closeModal() {
    this.activeModal.close('close');
  }
}
