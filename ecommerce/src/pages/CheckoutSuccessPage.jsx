import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";
import axios from "../utils/axios";

const CheckoutSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const txRef = searchParams.get("tx_ref");
        if (!txRef) {
          throw new Error("No transaction reference found");
        }

        // Verify payment status
        const response = await axios.post("/payment/callback", {
          tx_ref: txRef,
        });

        if (response.data.status === "success") {
          // Clear cart after successful payment
          await clearCart();
          setLoading(false);
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/checkout")}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            View Order
          </button>
          <button
            onClick={() => navigate("/products")}
            className="block w-full bg-white text-gray-900 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
