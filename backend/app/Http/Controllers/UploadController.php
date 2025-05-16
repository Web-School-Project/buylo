<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

class UploadController extends Controller
{
    protected $cloudinary;

    public function __construct()
    {
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

    /**
     * Upload multiple images to Cloudinary
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'images.*' => 'required|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $uploadedImages = [];
            foreach ($request->file('images') as $image) {
                $upload = $this->cloudinary->uploadApi()->upload($image->getRealPath(), [
                    'folder' => 'products',
                    'resource_type' => 'image'
                ]);

                $uploadedImages[] = [
                    'url' => $upload['secure_url'],
                    'cloudinary_id' => $upload['public_id']
                ];
            }

            return response()->json([
                'status' => 'success',
                'images' => $uploadedImages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an image from Cloudinary
     */
    public function destroy($cloudinaryId)
    {
        try {
            $this->cloudinary->uploadApi()->destroy($cloudinaryId);
            return response()->json([
                'status' => 'success',
                'message' => 'Image deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete image: ' . $e->getMessage()
            ], 500);
        }
    }
} 