import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Product } from 'src/app/interfaces/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent implements OnInit, OnDestroy {
  private productSubject: Subject<Product[]> = new Subject();

  private subscription: Subscription = new Subscription();

  id!: number;

  editProductForm: FormGroup;

  product$!: Observable<Product>;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.editProductForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      image: ['', [Validators.required]],
      price: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.subscription.add(
      this.productService
        .getOne(this.id)
        .subscribe((product) => this.editProductForm.patchValue(product)),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getRequiredError() {
    return 'This field is required';
  }

  getPriceError() {
    if (this.editProductForm.controls.price.hasError('pattern')) {
      return 'Price can only contain numbers';
    }
    return this.editProductForm.controls.price.hasError('required')
      ? 'This field is required'
      : null;
  }

  submit(): void {
    if (this.editProductForm.valid) {
      this.subscription.add(
        this.productService
          .update(this.id, this.editProductForm.getRawValue())
          .subscribe(() => this.router.navigate(['/products'])),
      );
    }
  }
}
