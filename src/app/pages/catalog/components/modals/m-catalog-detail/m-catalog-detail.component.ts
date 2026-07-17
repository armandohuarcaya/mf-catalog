import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SCartService } from '../../../services/s-cart.service';
import {
  NbCardModule, NbButtonModule, NbInputModule, NbIconModule, NbTabsetModule, NbBadgeModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbDialogRef } from '@nebular/theme';
import { NgbCarouselConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-m-catalog-detail',
  imports: [CommonModule, FormsModule, NbCardModule, NbButtonModule, NbInputModule,
    NbEvaIconsModule, NbIconModule, NgbCarouselModule, NgbModule,
    NbTabsetModule, NbBadgeModule],
  templateUrl: './m-catalog-detail.component.html',
  styleUrl: './m-catalog-detail.component.scss',
  providers: [NgbCarouselConfig]
})
export class MCatalogDetailComponent implements OnInit {
  @Input() item: any = '';
  Math = Math;
  quantity = signal(1);
  selectedImage = signal(0);
  cartService = inject(SCartService);

  constructor(
    public activeModal: NbDialogRef<MCatalogDetailComponent>,
    config: NgbCarouselConfig
  ) {
    config.interval = 3000;
    config.wrap = true;
    config.keyboard = true;
    config.pauseOnHover = true;
  }

  ngOnInit(): void {
    console.log(this.item);
  }

  /** Cierra el modal de detalle */
  closeModal(): void {
    this.activeModal.close('close');
  }

  /** Reduce la cantidad a agregar (mínimo 1) */
  decreaseQuantity(): void {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  /** Aumenta la cantidad a agregar (máximo 99) */
  increaseQuantity(): void {
    this.quantity.update(q => Math.min(99, q + 1));
  }

  /** Agrega el producto al carrito con la cantidad seleccionada y cierra el modal */
  addToCart(): void {
    this.cartService.addItem(this.item, this.quantity());
    this.closeModal();
  }

  /**
   * Selecciona una imagen de la galería para mostrar como principal.
   * @param index Índice de la imagen en la galería
   */
  selectImage(index: number): void {
    this.selectedImage.set(index);
  }

  /**
   * Maneja el cambio manual de cantidad desde el input.
   * @param value Valor ingresado (se normaliza entre 1 y 99)
   */
  onQuantityChange(value: any): void {
    const qty = Number(value) || 0;
    this.quantity.set(Math.max(1, Math.min(99, qty)));
  }
}
