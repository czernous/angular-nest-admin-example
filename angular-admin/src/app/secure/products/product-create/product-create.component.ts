import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent implements OnDestroy {
  private productSubject: Subject<Product[]> = new Subject();

  private subscription: Subscription = new Subscription();

  createProductForm: FormGroup;

  product$!: Observable<Product>;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private router: Router,
  ) {
    this.createProductForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      image: ['', [Validators.required]],
      price: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getRequiredError() {
    return 'This field is required';
  }

  getPriceError() {
    if (this.createProductForm.controls.price.hasError('pattern')) {
      return 'Price can only contain numbers';
    }
    return this.createProductForm.controls.price.hasError('required')
      ? 'This field is required'
      : null;
  }

  submit(): void {
    if (this.createProductForm.valid) {
      this.subscription.add(
        this.productService
          .create(this.createProductForm.getRawValue())
          .subscribe(() => this.router.navigate(['/products'])),
      );
    }
  }
}
