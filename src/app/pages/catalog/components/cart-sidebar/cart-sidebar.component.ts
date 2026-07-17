import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCartService } from '../../services/s-cart.service';
import { NbCardModule, NbButtonModule, NbIconModule, NbListModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule, NbIconModule, NbEvaIconsModule, NbListModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss'
})
export class CartSidebarComponent {
  cartService = inject(SCartService);

  /** Control de apertura/cierre del sidebar */
  isOpen = signal(false);

  /** Alterna la visibilidad del sidebar */
  toggle(): void { this.isOpen.update(v => !v); }

  /** Abre el sidebar */
  open(): void { this.isOpen.set(true); }

  /** Cierra el sidebar */
  close(): void { this.isOpen.set(false); }

  /**
   * Incrementa en 1 la cantidad de un producto en el carrito.
   * @param productId ID del producto a incrementar
   */
  addOne(productId: number | string): void {
    const item = this.cartService.items().find(i => (i.product?.id ?? i.product?._id) === productId);
    if (item) this.cartService.updateQuantity(productId, item.quantity + 1);
  }

  /**
   * Decrementa en 1 la cantidad de un producto (mínimo 1).
   * @param productId ID del producto a decrementar
   */
  removeOne(productId: number | string): void {
    const item = this.cartService.items().find(i => (i.product?.id ?? i.product?._id) === productId);
    if (item) this.cartService.updateQuantity(productId, item.quantity - 1);
  }

  /**
   * Elimina un producto completamente del carrito.
   * @param productId ID del producto a eliminar
   */
  removeItem(productId: number | string): void {
    this.cartService.removeItem(productId);
  }

  /**
   * Procesa el pago mostrando un resumen de compra en un modal nativo.
   * Muestra los items, el total y permite confirmar o seguir comprando.
   */
  checkout(): void {
    const count = this.cartService.count();
    const total = this.cartService.total();
    if (count === 0) return;

    const items = this.cartService.items().map(i =>
      `• ${i.product.name} x${i.quantity} — S/ ${(i.product.price * i.quantity).toFixed(2)}`
    ).join('\n');

    const modal = document.createElement('div');
    modal.className = 'checkout-modal-overlay';
    modal.innerHTML = `
      <div class="checkout-modal">
        <div class="checkout-header">
          <span class="checkout-icon">🧾</span>
          <h2>Resumen de Compra</h2>
        </div>
        <div class="checkout-body">
          <div class="checkout-items">${items.replace(/\n/g, '<br>')}</div>
          <div class="checkout-total-row">
            <span>Total</span>
            <strong>S/ ${total.toFixed(2)}</strong>
          </div>
          <p class="checkout-thanks">¡Gracias por tu compra en <strong>Carmi Art</strong>! ❤️</p>
        </div>
        <div class="checkout-footer">
          <button class="checkout-btn checkout-btn-primary" id="checkoutConfirmBtn">Confirmar Pedido</button>
          <button class="checkout-btn checkout-btn-ghost" id="checkoutCancelBtn">Seguir Comprando</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    document.getElementById('checkoutConfirmBtn')?.addEventListener('click', () => {
      modal.remove();
      this.cartService.clearCart();
      this.close();
    });

    document.getElementById('checkoutCancelBtn')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}
