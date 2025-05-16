<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $query = Order::with(['items', 'user'])->latest();
    
        // If the authenticated user is NOT an admin, filter by their user ID
        if (!Auth::user()->isAdmin()) { // Assuming you have an isAdmin() method on your User model
            $query->where('user_id', Auth::id());
        }
    
        $orders = $query->get();
    
        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'shipping_address' => 'required|array',
            'shipping_address.street' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'required|string',
            'shipping_address.zip_code' => 'required|string',
            'shipping_address.country' => 'required|string',
            'total_amount' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'user_id' => Auth::id(),
                'total_amount' => $request->total_amount,
                'status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'payment_status' => 'pending'
            ]);

            // Create order items
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order created successfully',
                'data' => $order->load('items')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Order $order)
    {
        // Check if the order belongs to the authenticated user
        if ($order->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order->load(['items', 'user'])
        ]);
    }

    public function cancel(Order $order)
    {
        // Check if the order belongs to the authenticated user
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Only allow cancellation of pending orders
        if ($order->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending orders can be cancelled'
            ], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled successfully',
            'data' => $order
        ]);
    }

    public function update(Request $request, Order $order)
    {
        // Only admin can update orders
        if (!Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'required|in:pending,completed,failed'
        ]);

        $order->update($request->only(['status', 'payment_status']));

        return response()->json([
            'status' => 'success',
            'message' => 'Order updated successfully',
            'data' => $order
        ]);
    }

    public function destroy(Order $order)
    {
        // Only admin can delete orders
        if (!Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Order deleted successfully'
        ]);
    }
}
