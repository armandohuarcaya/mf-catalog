import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SCatalogService {
  api:any = {
    demo: 'https://dummyjson.com',
  };
  constructor(private httpClient: HttpClient) { }
  getProducts$(params: any) {
    return this.httpClient.get(`${this.api.demo}/products`, {params});
  }
}
