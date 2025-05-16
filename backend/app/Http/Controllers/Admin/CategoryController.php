<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Log; // Import Log facade

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        try {
            $categories = Category::all();
            return response()->json([
                'status' => 'success',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch categories: ' . $e->getMessage()); // Added logging
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:categories',
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                Log::warning('Category creation validation failed', ['errors' => $validator->errors()->toArray()]); // Added logging
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                // Cloudinary upload logic
                $upload = Cloudinary::uploadApi()->upload($image->getRealPath(), [
                    'folder' => 'categories', // Specify your Cloudinary folder
                    'resource_type' => 'image'
                ]);

                $data['image'] = [
                    'url' => $upload['secure_url'],
                    'cloudinary_id' => $upload['public_id'],
                    'is_primary' => true // Assuming this structure
                ];
                $data['cloudinary_id'] = $upload['public_id']; // Store Cloudinary public ID
            } else {
                 // If no new image is uploaded, ensure image data is not set or is null
                 // depending on your database schema and desired behavior.
                 // If 'image' is a JSON column, you might explicitly set it to null if no image was previously there or if it was removed.
                 // If it's just storing the URL/ID directly, ensure those fields are handled.
                 // For updates, the frontend should handle removing the old image if needed.
                 unset($data['image']); // Don't include 'image' if no file was uploaded
                 // If you allow removing the image during edit, you might need a separate flag
                 // or check if existing_image_url was sent as null from frontend.
            }

            $category = Category::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create category: ' . $e->getMessage(), ['exception' => $e]); // Added logging
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch category: ' . $e->getMessage(), ['exception' => $e]); // Added logging
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch category'
            ], 500);
        }
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        // --- Log Incoming Request Data ---
        // Log $request->all() might not show non-file fields for PUT/PATCH FormData
        Log::info('Category Update Request Data (all()):', $request->all());
        // Log specific inputs to verify they are received
        Log::info('Category Update Request Data (inputs):', [
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'has_image_file' => $request->hasFile('image'),
            'existing_image_url_input' => $request->input('existing_image_url'),
        ]);
        // --- End Log ---

        try {
            // Manually prepare data for validation to ensure 'name' and 'description' are included
            // regardless of how $request->all() behaves with FormData PUT.
            $validationData = [
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'image' => $request->file('image'), // Include file for validation
            ];

            // Note: 'unique' rule needs to ignore the current category's name
            $validator = Validator::make($validationData, [ // Validate against prepared data
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                Log::warning('Category update validation failed', ['errors' => $validator->errors()->toArray(), 'request_data' => $validationData]); // Log validation data
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'request_data' => $validationData
                ], 422);
            }

            // Prepare data for updating the model
            $updateData = [
                'name' => $request->input('name'),
                'description' => $request->input('description'),
            ];

            // Handle image update
            if ($request->hasFile('image')) {
                // Delete old image from Cloudinary if exists
                if ($category->cloudinary_id) {
                    try {
                         Cloudinary::uploadApi()->destroy($category->cloudinary_id);
                         Log::info('Deleted old Cloudinary image: ' . $category->cloudinary_id);
                    } catch (\Exception $e) {
                         Log::error('Failed to delete old Cloudinary image: ' . $category->cloudinary_id . ' - ' . $e->getMessage());
                         // Continue with the update even if old image deletion fails
                    }
                }

                $image = $request->file('image');
                // Cloudinary upload logic
                $upload = Cloudinary::uploadApi()->upload($image->getRealPath(), [
                    'folder' => 'categories', // Specify your Cloudinary folder
                    'resource_type' => 'image'
                ]);

                $updateData['image'] = [
                    'url' => $upload['secure_url'],
                    'cloudinary_id' => $upload['public_id'],
                    'is_primary' => true // Assuming this structure
                ];
                $updateData['cloudinary_id'] = $upload['public_id']; // Store Cloudinary public ID

            } elseif ($request->input('existing_image_url') === null && $category->cloudinary_id) {
                 // Case: Frontend explicitly indicates image should be removed
                 // Check if existing_image_url was sent as null, and if there was an existing image
                 try {
                     Cloudinary::uploadApi()->destroy($category->cloudinary_id);
                     Log::info('Deleted existing Cloudinary image as requested: ' . $category->cloudinary_id);
                 } catch (\Exception $e) {
                     Log::error('Failed to delete Cloudinary image during removal: ' . $category->cloudinary_id . ' - ' . $e->getMessage());
                 }
                 // Set image fields to null in the database
                 $updateData['image'] = null;
                 $updateData['cloudinary_id'] = null;
            }
            // Note: If no new image, and existing image was NOT removed,
            // we don't include 'image' or 'cloudinary_id' in $updateData,
            // so the existing values in the database are preserved.


            $category->update($updateData); // Update the category with the prepared data

            return response()->json([
                'status' => 'success',
                'message' => 'Category updated successfully',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update category: ' . $e->getMessage(), ['exception' => $e, 'request_data' => $request->all()]); // Added logging
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        try {
            // Delete image from Cloudinary if exists
            if ($category->cloudinary_id) {
                try {
                    Cloudinary::uploadApi()->destroy($category->cloudinary_id);
                    Log::info('Deleted Cloudinary image during category deletion: ' . $category->cloudinary_id);
                } catch (\Exception $e) {
                    Log::error('Failed to delete Cloudinary image during deletion: ' . $category->cloudinary_id . ' - ' . $e->getMessage());
                    // Continue with category deletion even if image deletion fails
                }
            }

            $category->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete category: ' . $e->getMessage(), ['exception' => $e, 'category_id' => $category->id]); // Added logging
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete category: ' . $e->getMessage()
            ], 500);
        }
    }
}
