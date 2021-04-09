import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProductCreateDto } from './models/productCreate.dto';
import { ProductUpdateDto } from './models/productUpdate.dto';
import { ProductService } from './product.service';

@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get()
  async getAllProducts(@Query('page') page = 1) {
    return this.productService.paginate(page);
  }

  @Post()
  async createProduct(@Body() body: ProductCreateDto) {
    return this.productService.create(body);
  }

  @Get(':id')
  async getProduct(@Param('id') id: number) {
    return this.productService.findOne({ id });
  }

  @Put(':id')
  async updateProduct(@Param('id') id: number, @Body() body: ProductUpdateDto) {
    await this.productService.update(id, body);

    return this.productService.findOne({ id });
  }
  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return this.productService.delete(id);
  }
}
