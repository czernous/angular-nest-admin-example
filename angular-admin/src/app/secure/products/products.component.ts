import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subject, Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit, OnDestroy {
  meta: any = {};

  page = 1;

  productsSubject: Subject<Product[]> = new Subject();

  private subscription: Subscription = new Subscription();

  private products: Product[] = [];

  displayedColumns: string[] = ['id', 'image', 'title', 'price', 'action'];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handlePage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.loadProducts();
  }

  loadProducts(): void {
    this.subscription.add(
      this.productService.getAll(this.page).subscribe((data) => {
        this.products = data.data;
        this.meta = data.meta;
        this.productsSubject.next(this.products);
      }),
    );
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.subscription.add(
        this.productService.delete(id).subscribe(() => {
          this.products = this.products.filter((p) => p.id !== id);
          this.productsSubject.next(this.products);
        }),
      );
    }
  }
}
