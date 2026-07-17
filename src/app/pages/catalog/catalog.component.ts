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
  shopping:any[] = [];
  constructor() {}
  ngOnInit(): void {
    this.getProducts();
  }
  getProducts(): void {
    const params = {
      page: 1,
      size: 100
    };
    this.catalogServ.getProducts$(params).subscribe((products:any) => {
      // this.products = products.products || [];
      // this.products = (products.data && products.data.filter((a:any) => a.gallery.length>0)) || [];
      this.products = products.data || [];
      if (this.products.length>0) {
        this.products.map((b:any) => {
          b.picture_main = {url: 'https://cdn-icons-png.flaticon.com/512/85/85488.png'};
          if (b.gallery.length>0) {
            b.gallery.map((c:any) => {
              if (c.main) {
                b.picture_main = c;
              }
            })
            if (!b.picture_main) {
              b.picture_main = b.gallery[0];
            }
          }
        });
      }
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
  addItem() {
    // const personas: Persona[] = JSON.parse(localStorage.getItem('personas') || '[]');
    // localStorage.setItem('mf-shoping', JSON.stringify({personas: holas}));
  }
}
