import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartSlider = ({ isOpen, onClose, store, onCartUpdate }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    // Handle open/close animations
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Small delay to trigger animation after mount
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
            fetchCart();
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(false);
            document.body.style.overflow = '';
            // Wait for animation to complete before hiding
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await store.getCart();
            setCart(data.cart || []);
        } catch (err) {
            console.error('Failed to fetch cart', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (productId, newQty) => {
        try {
            if (newQty <= 0) {
                await store.removeFromCart(productId);
            } else {
                await store.updateCartItem(productId, newQty);
            }
            fetchCart();
            onCartUpdate?.();
        } catch (err) {
            console.error('Failed to update cart', err);
        }
    };

    const removeItem = async (productId) => {
        try {
            await store.removeFromCart(productId);
            fetchCart();
            onCartUpdate?.();
        } catch (err) {
            console.error('Failed to remove item', err);
        }
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    };

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Overlay with blur */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Slider Panel */}
            <div
                className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-1 -ml-1 text-gray-500 hover:text-gray-900 md:hidden"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-lg md:text-xl font-bold flex items-center gap-3">
                            <div className="hidden md:flex w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                                <ShoppingBag size={20} className="text-primary-600" />
                            </div>
                            Your Cart
                            {cart.length > 0 && (
                                <span className="text-sm font-normal text-gray-500">({cart.length})</span>
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close cart"
                    >
                        <X size={22} className="text-gray-500" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
                            <p className="text-gray-500">Loading your cart...</p>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={36} className="text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Your cart is empty</h3>
                            <p className="text-gray-500 text-sm text-center max-w-xs">
                                Looks like you haven't added anything to your cart yet. Start shopping!
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item, index) => (
                                <div
                                    key={item.product._id}
                                    className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                                    style={{
                                        animation: isAnimating ? `slideInRight 0.3s ease-out ${index * 0.05}s both` : 'none'
                                    }}
                                >
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded-xl"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                                        <p className="text-sm text-gray-500">{item.product.type}</p>
                                        {item.variant && item.variant !== 'VARIANT_NOT_REQUIRED' && (
                                            <p className="text-sm font-medium text-primary-600 mt-0.5">
                                                Variant: {item.variant}
                                            </p>
                                        )}
                                        <p className="font-bold text-primary-600 mt-1">₹{item.product.price}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center bg-gray-100 rounded-lg">
                                                <button
                                                    onClick={() => updateQty(item.product._id, item.qty - 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-semibold text-sm">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.product._id, item.qty + 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-r-lg transition"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.product._id)}
                                                className="ml-auto w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Total & Checkout */}
                {cart.length > 0 && (
                    <div className="border-t border-gray-100 p-4 safe-area-bottom bg-gray-50/90 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600 font-medium">Subtotal</span>
                            <span className="text-xl font-bold text-gray-900">₹{getTotal().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                        >
                            Proceed to Checkout
                        </button>
                        <p className="text-[10px] text-gray-500 text-center mt-2">
                            Shipping & taxes calculated at checkout
                        </p>
                    </div>
                )}
            </div>

            {/* Animation keyframes */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default CartSlider;



