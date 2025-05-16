<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of all products.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images']);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort by price
        if ($request->has('sort')) {
            $direction = $request->input('direction', 'asc');
            $query->orderBy('price', $direction);
        }

        // Paginate results
        $products = $query->paginate(12);

        return response()->json($products);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::with(['category', 'images'])->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'images' => 'required|array|min:1',
            'images.*' => 'required|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $images = $data['images'];
        unset($data['images']);

        // Generate unique slug
        $baseSlug = Str::slug($data['name']);
        $slug = $baseSlug;
        $counter = 1;
        
        // Keep trying until we find a unique slug
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        $data['slug'] = $slug;

        // Create product
        $product = Product::create($data);

        // Upload images to Cloudinary and create ProductImage records
        foreach ($images as $index => $image) {
            $upload = Cloudinary::uploadApi()->upload($image->getRealPath(), [
                'folder' => 'products',
                'resource_type' => 'image'
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'cloudinary_id' => $upload['public_id'],
                'url' => $upload['secure_url'],
                'is_primary' => $index === 0,
                'order' => $index
            ]);

            // Set the first image as the product's primary image
            if ($index === 0) {
                $product->update([
                    'image' => $upload['secure_url'],
                    'cloudinary_id' => $upload['public_id']
                ]);
            }
        }

        return response()->json($product->load('images'), 201);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'images' => 'sometimes|array',
            'images.*' => 'sometimes|image|max:2048',
            'delete_images' => 'sometimes|array',
            'delete_images.*' => 'exists:product_images,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Handle image deletions
        if (isset($data['delete_images'])) {
            foreach ($data['delete_images'] as $imageId) {
                $image = ProductImage::find($imageId);
                if ($image) {
                    // Delete from Cloudinary
                    Cloudinary::uploadApi()->destroy($image->cloudinary_id);
                    // Delete from database
                    $image->delete();
                }
            }
            unset($data['delete_images']);
        }

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $lastOrder = $product->images()->max('order') ?? -1;
            foreach ($request->file('images') as $index => $image) {
                $upload = Cloudinary::uploadApi()->upload($image->getRealPath(), [
                    'folder' => 'products',
                    'resource_type' => 'image'
                ]);

                $lastOrder++;
                ProductImage::create([
                    'product_id' => $product->id,
                    'cloudinary_id' => $upload['public_id'],
                    'url' => $upload['secure_url'],
                    'is_primary' => $product->images()->count() === 0 && $index === 0,
                    'order' => $lastOrder
                ]);

                // If this is the first image and product has no primary image, set it
                if ($product->images()->count() === 0 && $index === 0) {
                    $product->update([
                        'image' => $upload['secure_url'],
                        'cloudinary_id' => $upload['public_id']
                    ]);
        }
            }
        }

        $product->update($data);

        return response()->json($product->load('images'));
    }

    /**
     * Remove the specified product.
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            
            // Load the product with its images relationship
            $product = Product::with('images')->findOrFail($id);

            // Delete all associated images from Cloudinary and database
            $images = $product->images;
            if ($images && count($images) > 0) {
                foreach ($images as $image) {
                    try {
                        // Delete from Cloudinary
                        Cloudinary::uploadApi()->destroy($image->cloudinary_id);
                    } catch (\Exception $e) {
                        // Log the error but continue with deletion
                        \Log::error("Failed to delete image from Cloudinary: " . $e->getMessage());
                    }
                }
            }

            // Delete all product images from database
            $product->images()->delete();

            // Force delete the product (permanent deletion)
            $product->forceDelete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Product and all associated images deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }
} 