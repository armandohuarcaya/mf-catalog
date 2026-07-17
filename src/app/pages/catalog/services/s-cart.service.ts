import { Injectable, signal, computed, effect } from '@angular/core';
import { sanitizeProduct } from './sanitize.util';

export interface CartItem {
  product: any;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class SCartService {
  private readonly STORAGE_KEY = 'mf-catalog-cart';

  /** Estado interno del carrito */
  private cartItems = signal<CartItem[]>(this.loadCart());

  /** Lista de items en el carrito */
  readonly items = computed(() => this.cartItems());

  /** Cantidad total de productos sumando todas las cantidades */
  readonly count = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  /** Monto total del carrito sumando precio * cantidad de cada item */
  readonly total = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  });

  /** Indica si el carrito está vacío */
  readonly isEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    // Guarda automáticamente en localStorage ante cualquier cambio
    effect(() => {
      this.saveCart(this.cartItems());
    });
  }

  /**
   * Agrega un producto al carrito. Si ya existe, incrementa su cantidad.
   * @param product Producto a agregar
   * @param quantity Cantidad a agregar (por defecto 1)
   */
  addItem(product: any, quantity: number = 1): void {
    const sanitized = sanitizeProduct(product);
    if (!sanitized.id) return;

    this.cartItems.update(items => {
      const existing = items.find(item => {
        const itemId = item.product?.id ?? item.product?._id;
        return itemId != null && itemId === sanitized.id;
      });
      if (existing) {
        existing.quantity += quantity;
        return [...items];
      }
      return [...items, { product: sanitized, quantity }];
    });
  }

  /**
   * Elimina un producto del carrito por su ID.
   * @param productId ID del producto a eliminar
   */
  removeItem(productId: number | string): void {
    if (productId == null) return;
    this.cartItems.update(items => items.filter(item => {
      const id = item.product?.id ?? item.product?._id;
      return id !== productId;
    }));
  }

  /**
   * Actualiza la cantidad de un producto. Si la cantidad es <= 0, lo elimina.
   * @param productId ID del producto
   * @param quantity Nueva cantidad
   */
  updateQuantity(productId: number | string, quantity: number): void {
    if (productId == null) return;
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.cartItems.update(items => {
      const existing = items.find(item => {
        const id = item.product?.id ?? item.product?._id;
        return id === productId;
      });
      if (existing) {
        existing.quantity = quantity;
        return [...items];
      }
      return items;
    });
  }

  /** Vacía el carrito completamente */
  clearCart(): void {
    this.cartItems.set([]);
  }

  /**
   * Carga el carrito desde localStorage al iniciar el servicio.
   * Sanitiza los productos por si localStorage tiene datos antiguos.
   */
  private loadCart(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const items: CartItem[] = JSON.parse(data);
      return items.map(item => ({
        ...item,
        product: sanitizeProduct(item.product)
      }));
    } catch {
      return [];
    }
  }

  /** Guarda el carrito en localStorage */
  private saveCart(items: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }
}
