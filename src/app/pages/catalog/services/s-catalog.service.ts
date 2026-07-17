import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SCatalogService {
  api: any = {
    product: `${environment.apiUrls.art}/api/product`
  };

  constructor(private httpClient: HttpClient) { }

  /**
   * Obtiene productos desde la API con paginación.
   * @param params { page: number, size: number } — página y cantidad por página
   * @returns Observable con { data: [], total, totalPages }
   */
  getProducts$(params: any) {
    return this.httpClient.get(`${this.api.product}/search`, { params });
  }
}
