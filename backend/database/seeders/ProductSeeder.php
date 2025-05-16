<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test category if none exists
        $category = Category::firstOrCreate(
            ['name' => 'Electronics'],
            ['description' => 'Electronic devices and accessories']
        );

        // Create a test product
        $product = Product::create([
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock' => 100,
            'quantity' => 1,
            'category_id' => $category->id,
            'slug' => 'test-product'
        ]);

        // Add some test images
        ProductImage::create([
            'product_id' => $product->id,
            'cloudinary_id' => 'test_image_1',
            'url' => 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/test-1.jpg',
            'is_primary' => true,
            'order' => 0
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'cloudinary_id' => 'test_image_2',
            'url' => 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/test-2.jpg',
            'is_primary' => false,
            'order' => 1
        ]);
    }
} 