<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\ChapaService; // Assume this service exists and is implemented correctly
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str; // Import Str facade

class PaymentController extends Controller
{
    protected $chapaService;

    /**
     * Constructor to inject the ChapaService dependency.
     * Applies 'auth:sanctum' middleware to the 'initialize' method only.
     *
     * @param ChapaService $chapaService
     */
    public function __construct(ChapaService $chapaService)
    {
        $this->chapaService = $chapaService;
        // Apply middleware only to the 'initialize' method
        $this->middleware('auth:sanctum')->only('initialize');
    }

    /**
     * Initializes a payment transaction via Chapa for a given order.
     * Requires authentication via 'auth:sanctum'.
     *
     * @param Request $request Contains 'order_id'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function initialize(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        // Find the order with the associated user
        $order = Order::with('user')->findOrFail($request->order_id);

        // --- Log Order Data ---
        Log::info('Initializing payment for Order ID: ' . $order->id, [
            'order_id' => $order->id,
            'total_amount' => $order->total_amount,
            'user_email' => $order->user->email,
            'user_name' => $order->user->name,
            // Add other relevant order fields you want to log
        ]);
        // --- End Log Order Data ---


        // --- Name Splitting Logic ---
        // Attempt to split the user's name into first and last names.
        // This assumes the user->name is a single string (e.g., "John Doe").
        // Adjust this logic if your user model stores names differently.
        $fullName = trim($order->user->name);
        $nameParts = explode(' ', $fullName, 2); // Split into at most 2 parts

        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';
        // --- End Name Splitting Logic ---

        // Prepare customization data, ensuring it meets Chapa's validation rules
        $customizationTitle = 'EthioShop Payment';
        $customizationDescription = 'Payment for Order #' . $order->id;

        // --- Chapa Customization Validation Fixes ---
        // 1. Truncate title to max 16 characters
        $customizationTitle = Str::limit($customizationTitle, 16, ''); // Use empty string for ending to just truncate

        // 2. Sanitize description: allow only letters, numbers, hyphens, underscores, spaces, and dots
        $customizationDescription = preg_replace('/[^a-zA-Z0-9\-_ .\s]/', '', $customizationDescription);
        // --- End Chapa Customization Validation Fixes ---

        // Generate a unique transaction reference.
        $txRef = 'ORDER-' . $order->id . '-' . time() . '-' . Str::random(5);


        // Prepare data for the Chapa initialization request
        $paymentData = [
            'amount' => $order->total_amount,
            'currency' => 'ETB', // Assuming currency is always ETB
            'email' => $order->user->email,
            'first_name' => $firstName, // Use extracted first name
            'last_name' => $lastName,   // Use extracted last name
            'tx_ref' => $txRef, // Use the generated transaction reference
            'callback_url' => route('payment.callback'), // URL Chapa sends webhook to
            // IMPORTANT: This should be your frontend success page URL
            // Note: Using route('payment.success') here is for the browser redirect,
            // the actual status update relies on the callback_url.
            'return_url' => route('payment.success') . '?tx_ref=' . $txRef, // Redirect to backend success, which then redirects to frontend
            'customization' => [
                'title' => $customizationTitle,       // Use the sanitized title
                'description' => $customizationDescription, // Use the sanitized description
            ],
            // Add phone number if available on user model
            'phone_number' => $order->user->phone ?? '', // Assuming 'phone' attribute exists on User model
        ];

        try {
            // Call the ChapaService to initialize the payment
            $response = $this->chapaService->initializePayment($paymentData);

            // Check the response status from the ChapaService
            if (isset($response['status']) && $response['status'] === 'success') {
                // Update the order with the payment reference and set status to pending
                $order->update([
                    'payment_reference' => $txRef, // Use the generated transaction reference
                    'payment_status' => 'pending' // Status indicating payment process started
                ]);
                Log::info('Order ' . $order->id . ' updated with payment_reference: ' . $txRef);


                // Return the checkout URL received from Chapa to the frontend
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'checkout_url' => $response['data']['checkout_url']
                    ]
                ]);
            }

            // If Chapa initialization was not successful (based on service response)
            Log::error('Chapa initialization failed for order ' . $order->id . ': ' . json_encode($response));
            return response()->json([
                'status' => 'error',
                'message' => $response['message'] ?? 'Failed to initialize payment with Chapa'
            ], 400);

        } catch (\Exception $e) {
            // Catch any exceptions during the process (e.g., network errors, service errors)
            Log::error('Payment initialization failed for order ' . $order->id . ': ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Payment initialization failed due to a server error.'
            ], 500);
        }
    }

    /**
     * Handles the webhook callback from Chapa.
     * This method is called by Chapa's server after a transaction status change.
     * This endpoint should be publicly accessible for Chapa's servers.
     *
     * @param Request $request Contains transaction details, including 'tx_ref'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function callback(Request $request)
    {
        // Get the transaction reference from the request (sent by Chapa)
        $reference = $request->tx_ref;

        // Log the incoming webhook request for debugging
        Log::info('Chapa Webhook received', $request->all());

        if (!$reference) {
             Log::error('Chapa Webhook received without tx_ref');
             return response()->json(['status' => 'error', 'message' => 'Missing transaction reference'], 400);
        }

        try {
            Log::info('Attempting to verify transaction with Chapa for tx_ref: ' . $reference);
            // Verify the transaction status directly with Chapa using the service
            $response = $this->chapaService->verifyTransaction($reference);
            Log::info('Chapa verification response for tx_ref ' . $reference . ': ' . json_encode($response));


            // Check the verification response status
            if (isset($response['status']) && $response['status'] === 'success' && isset($response['data'])) {
                $transactionData = $response['data'];
                Log::info('Chapa verification successful for tx_ref: ' . $reference);


                // Find the order using the payment reference
                $order = Order::where('payment_reference', $reference)->first();

                if ($order) {
                    Log::info('Order found for payment_reference: ' . $reference . ', Order ID: ' . $order->id);

                    // Important: Add checks to ensure the amount and currency match the order
                    // This prevents potential fraud.
                    // Ensure order currency is stored, default to ETB if not.
                    $orderCurrency = $order->currency ?? 'ETB';
                    Log::info('Comparing order details for tx_ref ' . $reference, [
                        'order_amount' => $order->total_amount,
                        'chapa_amount' => $transactionData['amount'],
                        'order_currency' => $orderCurrency,
                        'chapa_currency' => $transactionData['currency'],
                        'order_status' => $order->payment_status,
                    ]);


                    if ($order->total_amount == $transactionData['amount'] && $orderCurrency == $transactionData['currency']) {
                         Log::info('Amount and currency match for order ' . $order->id);
                         // Update order status and details if verification is successful and details match
                         // Also check if the order is not already completed to prevent duplicate processing
                         if ($order->payment_status !== 'completed') {
                            Log::info('Order ' . $order->id . ' status is not completed, updating.');
                            $order->update([
                                'payment_status' => 'completed', // Or 'successful', based on your desired status names
                                'payment_details' => json_encode($transactionData) // Store full transaction details
                            ]);
                            Log::info('Order ' . $order->id . ' payment status updated to completed.');

                            // TODO: Trigger order confirmation email or other post-payment actions here
                            // For example: Mail::to($order->user->email)->send(new OrderConfirmed($order));
                         } else {
                             Log::info('Chapa Webhook: Order ' . $order->id . ' already completed, skipping update.');
                         }


                         return response()->json([
                             'status' => 'success',
                             'message' => 'Payment verified and order updated successfully'
                         ]);
                    } else {
                         // Log potential fraud attempt
                         Log::warning('Chapa Webhook: Amount or currency mismatch for tx_ref ' . $reference, [
                             'order_amount' => $order->total_amount,
                             'chapa_amount' => $transactionData['amount'],
                             'order_currency' => $orderCurrency,
                             'chapa_currency' => $transactionData['currency'],
                         ]);
                         // Optionally update order status to indicate verification issue
                         $order->update(['payment_status' => 'verification_mismatch']);

                         return response()->json([
                             'status' => 'error',
                             'message' => 'Payment verification failed: Amount or currency mismatch'
                         ], 400); // Return 400 to Chapa to indicate an issue
                    }

                } else {
                    // Order not found for the given reference
                    Log::error('Chapa Webhook: Order not found for tx_ref ' . $reference);
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Order not found for this transaction reference'
                    ], 404); // Return 404 if the order doesn't exist
                }
            } else {
                // Chapa verification failed
                Log::error('Chapa verification failed for tx_ref ' . $reference . ': ' . json_encode($response));
                // Optionally update order status to indicate verification failed
                 $order = Order::where('payment_reference', $reference)->first();
                 if ($order) {
                     $order->update(['payment_status' => 'verification_failed']);
                 }

                return response()->json([
                    'status' => 'error',
                    'message' => $response['message'] ?? 'Payment verification failed with Chapa'
                ], 400); // Return 400 to Chapa
            }

        } catch (\Exception $e) {
            // Catch any exceptions during the verification process
            Log::error('Payment verification failed for tx_ref ' . $reference . ': ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Payment verification failed due to a server error.'
            ], 500); // Return 500 to Chapa
        }
    }

    /**
     * Handles the user's return after completing payment on Chapa.
     * This is primarily a landing page; actual payment status update happens via the webhook.
     * This endpoint should be publicly accessible as it's a browser redirect target.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function success(Request $request)
    {
        // Get the transaction reference from the request (Chapa should pass it back)
        $txRef = $request->query('tx_ref'); // Chapa usually includes tx_ref in the return_url

        // Define your frontend success page URL
        // Make sure to configure FRONTEND_URL in your .env file
        // Using the hardcoded URL from your last example for now.
        $frontendSuccessUrl = "http://localhost:5173/checkout/success"; // Assuming this is your frontend success route

        // Add the transaction reference as a query parameter
        if ($txRef) {
            $frontendSuccessUrl .= '?tx_ref=' . $txRef;
        } else {
             // If tx_ref is missing from the return URL, you might want to redirect
             // to a generic order history page or an error page on the frontend.
             Log::warning('Chapa return_url hit without tx_ref query parameter.');
        }

        // Redirect the user's browser to the frontend success page
        return redirect($frontendSuccessUrl);
    }
}
