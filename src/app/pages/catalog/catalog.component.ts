import { NbEvaIconsModule } from '@nebular/eva-icons';
import { Component, OnInit, inject } from '@angular/core';
import { SCatalogService } from './services/s-catalog.service';
import {
  NbCardModule, NbButtonModule, NbInputModule, NbIconModule, NbDialogModule
} from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
import { MCatalogDetailComponent } from './components/modals/m-catalog-detail/m-catalog-detail.component';
import { LoginAuthComponent } from '../login-auth/login-auth.component';
@Component({
  selector: 'app-catalog',
  imports: [NbCardModule, NbButtonModule, NbInputModule, NbEvaIconsModule,  NbIconModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit{
  products:any[] = [];
  dialogService = inject(NbDialogService);
  catalogServ = inject(SCatalogService);
  constructor() {}
  ngOnInit(): void {
    this.getProducts();
  }
  getProducts(): void {
    const params = {};
    this.catalogServ.getProducts$(params).subscribe((products:any) => {
      this.products = products.products || [];
    });
  }
  openModal(item:any) {
    this.dialogService.open(MCatalogDetailComponent, {
      dialogClass: 'dialog-limited-height',
      context: {
        item: item,
      },
      closeOnBackdropClick: false,
      closeOnEsc: false,
    })
    .onClose.subscribe((result:any) => {
      if (result === 'ok') {

      }
    });
  }
  openLogin(item:any) {
    this.dialogService.open(LoginAuthComponent, {
      dialogClass: 'dialog-limited-height',
      context: {
        item: item,
      },
      closeOnBackdropClick: false,
      closeOnEsc: false,
    })
    .onClose.subscribe((result:any) => {
      if (result === 'ok') {

      }
    });
  }
}
