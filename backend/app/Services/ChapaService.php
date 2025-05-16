<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChapaService
{
    protected $baseUrl;
    protected $secretKey;
    protected $publicKey;

    public function __construct()
    {
        $this->baseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1');
        $this->secretKey = config('services.chapa.secret_key');
        $this->publicKey = config('services.chapa.public_key');

        if (!$this->secretKey || !$this->publicKey) {
            Log::error('Chapa API keys not configured');
        }
    }

    public function initializePayment(array $data)
    {
        Log::info('Initializing Chapa payment', ['data' => $data]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transaction/initialize', [
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'ETB',
                'email' => $data['email'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'tx_ref' => $data['tx_ref'] ?? Str::uuid(),
                'callback_url' => $data['callback_url'],
                'return_url' => $data['return_url'],
                'customization' => [
                    'title' => $data['customization']['title'] ?? 'Payment',
                    'description' => $data['customization']['description'] ?? 'Payment for your order',
                ],
            ]);

            $responseData = $response->json();
            Log::info('Chapa payment initialization response', ['response' => $responseData]);

            return $responseData;
        } catch (\Exception $e) {
            Log::error('Chapa payment initialization failed', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function verifyTransaction($reference)
    {
        Log::info('Verifying Chapa transaction', ['reference' => $reference]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->get($this->baseUrl . '/transaction/verify/' . $reference);

            $responseData = $response->json();
            Log::info('Chapa transaction verification response', ['response' => $responseData]);

            return $responseData;
        } catch (\Exception $e) {
            Log::error('Chapa transaction verification failed', [
                'error' => $e->getMessage(),
                'reference' => $reference
            ]);
            throw $e;
        }
    }
} 