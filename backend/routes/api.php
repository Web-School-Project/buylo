<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\PaymentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Product & Category routes (view only)
Route::get('/categories', [AdminCategoryController::class, 'index']);
Route::get('/categories/{category}', [AdminCategoryController::class, 'show']);
Route::get('/products', [AdminProductController::class, 'index']);
Route::get('/products/{product}', [AdminProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Order routes
    Route::apiResource('orders', OrderController::class);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

    // Upload routes
    Route::post('/upload', [UploadController::class, 'upload']);
    Route::delete('/upload/{cloudinaryId}', [UploadController::class, 'destroy']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Product management (create, update, delete)
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
        
        // Category management (create, update, delete)
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::get('/categories/{category}', [AdminCategoryController::class, 'show']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        // User management routes
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});

// Payment routes
Route::post('/payment/initialize', [PaymentController::class, 'initialize'])->name('payment.initialize');
Route::post('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');