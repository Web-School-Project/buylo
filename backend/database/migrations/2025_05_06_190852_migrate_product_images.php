<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Product;
use App\Models\ProductImage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all products with images in the JSON column
        $products = Product::whereNotNull('images')->get();

        foreach ($products as $product) {
            $images = $product->images;
            if (is_array($images)) {
                foreach ($images as $index => $image) {
                    if (is_array($image) && isset($image['url'])) {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'cloudinary_id' => $image['cloudinary_id'] ?? null,
                            'url' => $image['url'],
                            'is_primary' => $index === 0,
                            'order' => $index
                        ]);
                    }
                }
            }
        }

        // Remove the images column from products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the images column
        Schema::table('products', function (Blueprint $table) {
            $table->json('images')->nullable()->after('description');
        });

        // Move images back to JSON column
        $products = Product::with('images')->get();
        foreach ($products as $product) {
            $images = $product->images->map(function ($image) {
                return [
                    'url' => $image->url,
                    'cloudinary_id' => $image->cloudinary_id,
                    'is_primary' => $image->is_primary
                ];
            })->toArray();
            
            $product->images = $images;
            $product->save();
        }
    }
}; 