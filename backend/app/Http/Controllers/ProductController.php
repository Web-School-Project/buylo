<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

class ProductController extends Controller
{
    protected $cloudinary;

    protected function initializeCloudinary()
    {
        if (!$this->cloudinary) {
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => config('services.cloudinary.cloud_name'),
                    'api_key' => config('services.cloudinary.api_key'),
                    'api_secret' => config('services.cloudinary.api_secret'),
                ],
                'url' => [
                    'secure' => true
                ]
            ]);
            $this->cloudinary = new Cloudinary();
        }
        return $this->cloudinary;
    }

    /**
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'quantity' => 'required|integer|min:1',
            'category_id' => 'required|exists:categories,id',
            'images' => 'required|array|min:1',
            'images.*' => 'required|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        unset($data['images']); // Remove images from data array

        // Create product
        $product = Product::create($data);

        // Upload images to Cloudinary
        $cloudinary = $this->initializeCloudinary();
        foreach ($request->file('images') as $index => $image) {
            $upload = $cloudinary->uploadApi()->upload($image->getRealPath(), [
                'folder' => 'products',
                'resource_type' => 'image'
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'cloudinary_id' => $upload['public_id'],
                'url' => $upload['secure_url'],
                'is_primary' => $index === 0, // First image is primary
                'order' => $index
            ]);
        }

        return response()->json($product->load('images'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['category', 'images'])->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'quantity' => 'sometimes|required|integer|min:1',
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
            $cloudinary = $this->initializeCloudinary();
            foreach ($data['delete_images'] as $imageId) {
                $image = ProductImage::find($imageId);
                if ($image && $image->product_id === $product->id) {
                    // Delete from Cloudinary
                    $cloudinary->uploadApi()->destroy($image->cloudinary_id);
                    // Delete from database
                    $image->delete();
                }
            }
            unset($data['delete_images']);
        }

        // Handle new image uploads
        if (isset($data['images'])) {
            $cloudinary = $this->initializeCloudinary();
            foreach ($request->file('images') as $index => $image) {
                $upload = $cloudinary->uploadApi()->upload($image->getRealPath(), [
                    'folder' => 'products',
                    'resource_type' => 'image'
                ]);

                ProductImage::create([
                    'product_id' => $product->id,
                    'cloudinary_id' => $upload['public_id'],
                    'url' => $upload['secure_url'],
                    'is_primary' => $index === 0 && !$product->images()->exists(),
                    'order' => $product->images()->count() + $index
                ]);
            }
            unset($data['images']);
        }

        // Update product
        $product->update($data);

        return response()->json($product->load(['category', 'images']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        // Delete all associated images from Cloudinary
        $cloudinary = $this->initializeCloudinary();
        foreach ($product->images as $image) {
            $cloudinary->uploadApi()->destroy($image->cloudinary_id);
        }

        // Delete the product (this will cascade delete the images from the database)
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
