import { Component, OnInit, OnDestroy, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SCatalogService } from './services/s-catalog.service';
import { SCartService } from './services/s-cart.service';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';
import {
  NbCardModule, NbButtonModule, NbInputModule, NbIconModule,
  NbSpinnerModule, NbTooltipModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbDialogService } from '@nebular/theme';
import { MCatalogDetailComponent } from './components/modals/m-catalog-detail/m-catalog-detail.component';
import { LoginAuthComponent } from '../login-auth/login-auth.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { sanitizeProduct } from './services/sanitize.util';

@Component({
  selector: 'app-catalog',
  imports: [
    CommonModule, FormsModule,
    NbCardModule, NbButtonModule, NbInputModule, NbEvaIconsModule,
    NbIconModule, NbSpinnerModule,
    NbTooltipModule,
    CartSidebarComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {

  /** Lista completa de productos obtenidos de la API */
  products: any[] = [];

  /** Productos filtrados por búsqueda y categoría (los que se muestran) */
  filteredProducts: any[] = [];

  /** Término de búsqueda actual */
  searchTerm = '';

  /** Indica si se está cargando datos desde la API */
  isLoading = signal(false);

  /** Categoría seleccionada en el filtro ('all' = todas) */
  selectedCategory = signal('all');

  /** Lista de categorías disponibles extraídas de los productos */
  categories: string[] = [];

  /** Número de página actual */
  currentPage = signal(1);

  /** Total de páginas disponibles */
  totalPages = signal(1);

  /** Total de productos en el backend */
  totalItems = signal(0);

  /** Cantidad de productos por página */
  pageSize = 12;

  /** Máximo de páginas visibles en el paginador */
  maxVisiblePages = 7;

  dialogService = inject(NbDialogService);
  catalogServ = inject(SCatalogService);
  cartService = inject(SCartService);

  @ViewChild(CartSidebarComponent) cartSidebar!: CartSidebarComponent;

  /** Mensaje del toast de notificación */
  toastMessage = signal('');

  /** Control de visibilidad del toast */
  toastVisible = signal(false);

  /** Tipo de toast: éxito o información */
  toastType = signal<'success' | 'info'>('success');

  /** Timeout para auto-ocultar el toast */
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Datos del usuario logueado (null si no hay sesión) */
  user: any = null;

  /** Nombre visible del usuario en el header */
  userDisplayName = signal('');

  /** ID del producto recién agregado al carrito (para animación) */
  addedProductId = signal<number | null>(null);

  /** Control del menú desplegable del usuario */
  showUserMenu = signal(false);

  /** Año actual para el footer y badges */
  currentYear = new Date().getFullYear();

  /** Subject para debounce del buscador */
  private searchSubject = new Subject<string>();

  /** Subject para limpiar suscripciones al destruir el componente */
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filterProducts(term);
    });
  }

  ngOnInit(): void {
    this.loadUser();
    this.getProducts(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del usuario desde sessionStorage.
   * Si existe un usuario guardado, muestra su nombre en el header.
   */
  loadUser(): void {
    try {
      const userData = sessionStorage.getItem('mf-catalog-user');
      if (userData) {
        this.user = JSON.parse(userData);
        this.userDisplayName.set(this.user?.name || this.user?.email || 'Usuario');
      } else {
        this.user = null;
        this.userDisplayName.set('');
      }
    } catch {
      this.user = null;
      this.userDisplayName.set('');
    }
  }

  /**
   * Obtiene los productos desde la API para la página indicada.
   * Procesa los datos, aplica filtros y extrae categorías.
   * @param page Número de página a solicitar (empieza en 1)
   */
  getProducts(page: number = 1): void {
    this.isLoading.set(true);
    this.currentPage.set(page);
    const params = { page, size: this.pageSize };

    this.catalogServ.getProducts$(params).subscribe({
      next: (res: any) => {
        const rawProducts = res.data || [];
        this.products = this.processProducts(rawProducts);
        this.filteredProducts = [...this.products];
        this.filterProducts(this.searchTerm);
        this.totalItems.set(res.total ?? res.totalItems ?? res.count ?? 0);
        this.totalPages.set(res.totalPages ?? res.pages ?? Math.ceil((res.total ?? 100) / this.pageSize));
        this.extractCategories();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Sanitiza y normaliza cada producto del array.
   * @param products Array de productos crudos desde la API
   * @returns Productos procesados con imagen principal asignada
   */
  private processProducts(products: any[]): any[] {
    return products.map(b => {
      const sanitized = sanitizeProduct(b);
      const picture_main = this.getMainPicture(sanitized);
      return { ...sanitized, picture_main };
    });
  }

  /**
   * Obtiene la imagen principal de un producto desde su galería.
   * Busca primero la imagen marcada como `main`, o usa la primera disponible.
   * @param product Producto con galería de imágenes
   * @returns Objeto con la URL de la imagen principal
   */
  private getMainPicture(product: any): any {
    const defaultPic = { url: 'https://cdn-icons-png.flaticon.com/512/85/85488.png' };
    if (!product.gallery || product.gallery.length === 0) return defaultPic;
    const main = product.gallery.find((c: any) => c.main);
    return main || product.gallery[0];
  }

  /**
   * Extrae las categorías únicas de todos los productos cargados.
   */
  private extractCategories(): void {
    const cats = new Set<string>();
    this.products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    this.categories = Array.from(cats);
  }

  /**
   * Maneja el input de búsqueda con debounce de 300ms.
   * @param term Término ingresado por el usuario
   */
  onSearchInput(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  /**
   * Filtra los productos localmente por término de búsqueda y categoría.
   * Busca coincidencias en nombre, descripción, marca y categoría.
   * @param term Término de búsqueda a filtrar
   */
  private filterProducts(term: string): void {
    const search = term.toLowerCase().trim();
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !search ||
        (product.name?.toLowerCase().includes(search)) ||
        (product.description?.toLowerCase().includes(search)) ||
        (product.brand?.toLowerCase().includes(search)) ||
        (product.category?.toLowerCase().includes(search));

      const matchesCategory = this.selectedCategory() === 'all' ||
        product.category === this.selectedCategory();

      return matchesSearch && matchesCategory;
    });
  }

  /**
   * Cambia el filtro de categoría y resetea a la página 1 si es necesario.
   * @param category Nueva categoría seleccionada
   */
  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    if (this.currentPage() !== 1) {
      this.getProducts(1);
    } else {
      this.filterProducts(this.searchTerm);
    }
  }

  /**
   * Navega a la página indicada y hace scroll suave al contenido principal.
   * @param page Número de página destino
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.getProducts(page);
    document.querySelector('.main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Genera el array de números de página para el paginador,
   * incluyendo separadores elípticos (`-1`) cuando hay muchas páginas.
   * @returns Array con números de página y -1 para elipsis
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = this.maxVisiblePages;
    const pages: number[] = [];

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      let start = Math.max(1, current - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;
      if (end > total) {
        end = total;
        start = total - maxVisible + 1;
      }
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push(-1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total) {
        if (end < total - 1) pages.push(-1);
        pages.push(total);
      }
    }
    return pages;
  }

  /**
   * Abre el modal de detalle del producto usando NbDialogService.
   * @param item Producto a mostrar en detalle
   */
  openModal(item: any): void {
    this.dialogService.open(MCatalogDetailComponent, {
      dialogClass: 'dialog-limited-height',
      context: { item },
      closeOnBackdropClick: false,
      closeOnEsc: false,
    }).onClose.subscribe();
  }

  /**
   * Abre el modal de inicio de sesión.
   * Al cerrarse, si el usuario inició sesión, lo guarda en sessionStorage.
   */
  openLogin(): void {
    const ref = this.dialogService.open(LoginAuthComponent, {
      dialogClass: 'dialog-limited-height',
      context: { item: '' },
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });

    ref.onClose.subscribe((result: any) => {
      if (result?.user) {
        sessionStorage.setItem('mf-catalog-user', JSON.stringify(result.user));
        this.loadUser();
      }
    });
  }

  /**
   * Agrega un producto al carrito y muestra notificación toast.
   * También abre el sidebar del carrito automáticamente.
   * @param product Producto a agregar
   * @param qty Cantidad (por defecto 1)
   */
  addToCart(product: any, qty: number = 1): void {
    this.cartService.addItem(product, qty);
    this.showToast(`${product.name} agregado al carrito`, 'success');
    this.addedProductId.set(product.id);
    setTimeout(() => this.addedProductId.set(null), 600);
    this.cartSidebar?.open();
  }

  /**
   * Muestra una notificación toast con auto-ocultación a los 3 segundos.
   * @param message Mensaje a mostrar
   * @param type Tipo de notificación (success o info)
   */
  private showToast(message: string, type: 'success' | 'info' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastVisible.set(false);
    }, 3000);
  }

  /** Cierra el toast manualmente */
  dismissToast(): void {
    this.toastVisible.set(false);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  /** Alterna la visibilidad del menú desplegable del usuario */
  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  /** Cierra el menú desplegable del usuario */
  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  /** Cierra la sesión del usuario y limpia sessionStorage */
  logout(): void {
    sessionStorage.removeItem('mf-catalog-user');
    this.user = null;
    this.userDisplayName.set('');
    this.showUserMenu.set(false);
  }

  /** Hace scroll suave hasta el contenido principal */
  scrollToContent(): void {
    document.querySelector('.main-content')?.scrollIntoView({ behavior: 'smooth' });
  }

  /** Incrementa la cantidad rápida de un producto en la card */
  incrementCardQty(product: any): void {
    product._qty = (product._qty || 1) + 1;
  }

  /** Decrementa la cantidad rápida de un producto (mínimo 1) */
  decrementCardQty(product: any): void {
    product._qty = Math.max(1, (product._qty || 1) - 1);
  }

  /** Obtiene la cantidad rápida actual de un producto */
  getCardQty(product: any): number {
    return product._qty || 1;
  }
}
