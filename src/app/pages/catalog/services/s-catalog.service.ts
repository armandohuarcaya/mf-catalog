import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SCatalogService {
  api:any = {
    demo: 'https://dummyjson.com',
    product: `${environment.apiUrls.art}/api/product`
  };
  constructor(private httpClient: HttpClient) { }
  // getProducts$(params: any) {
  //   return this.httpClient.get(`${this.api.demo}/products`, {params});
  // }
  getProducts$(params: any) {
    return this.httpClient.get(`${this.api.product}/search`, {params});
  }
}
