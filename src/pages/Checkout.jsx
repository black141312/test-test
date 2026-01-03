import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, Plus, Check, ArrowLeft, CreditCard, Shield, Truck, Loader2, Trash2, Star, CheckCircle2, Package, X } from 'lucide-react';

const Checkout = ({ store, user }) => {
    const [cart, setCart] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [paymentError, setPaymentError] = useState('');
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('new'); // 'new' or methodId
    const [saveCardConsent, setSaveCardConsent] = useState(false);
    const [successModal, setSuccessModal] = useState({ show: false, trackingNumber: '', orderId: '' });
    const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });
    const navigate = useNavigate();

    // New address form
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
    });

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
        loadRazorpayScript();
    }, [user]);

    // Load Razorpay checkout script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cartData, addressData, configData, methodsData] = await Promise.all([
                store.getCart(),
                store.getAddresses(),
                store.getPaymentConfig().catch(() => null),
                store.getSavedPaymentMethods().catch(() => ({ savedMethods: [] }))
            ]);
            setCart(cartData.cart || []);
            // Handle both array and object response formats
            const addressList = Array.isArray(addressData) ? addressData : (addressData.addresses || []);
            setAddresses(addressList);
            setPhoneNumber(addressData.phoneNumber || '');
            setPaymentConfig(configData);
            setSavedMethods(methodsData.savedMethods || []);

            // Select default address
            const defaultAddr = addressList.find(a => a.isDefault);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr._id);
            }

            // Select default payment method
            const defaultMethod = methodsData.savedMethods?.find(m => m.isDefault);
            if (defaultMethod) {
                setSelectedPaymentMethod(defaultMethod._id);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const getSubtotal = () => cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    const getTax = () => getSubtotal() * 0.18;
    const getShipping = () => getSubtotal() > 500 ? 0 : 50;
    const getTotal = () => getSubtotal() + getTax() + getShipping();

    // Cart item editing functions
    const handleUpdateQty = async (productId, newQty, variant) => {
        if (newQty < 1) return;
        try {
            await store.updateCartItem(productId, newQty, variant);
            // Update local state
            setCart(prev => prev.map(item =>
                item.product._id === productId &&
                    ((!variant && !item.variant) || (variant && item.variant?.value === variant.value))
                    ? { ...item, qty: newQty }
                    : item
            ));
        } catch (err) {
            console.error('Failed to update quantity', err);
        }
    };

    const handleRemoveItem = async (productId, variant) => {
        try {
            await store.removeFromCart(productId, variant);
            // Update local state
            setCart(prev => prev.filter(item =>
                !(item.product._id === productId &&
                    ((!variant && !item.variant) || (variant && item.variant?.value === variant.value)))
            ));
        } catch (err) {
            console.error('Failed to remove item', err);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await store.addAddress({
                ...newAddress,
                isDefault: addresses.length === 0
            });
            setShowAddAddress(false);
            setNewAddress({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India' });
            fetchData();
        } catch (err) {
            console.error('Failed to add address', err);
        }
    };

    const handleUpdatePhone = async () => {
        try {
            await store.updatePhone(phoneNumber);
        } catch (err) {
            console.error('Failed to update phone', err);
        }
    };

    const getCardIcon = (cardType) => {
        const icons = {
            visa: '💳',
            mastercard: '💳',
            rupay: '🏧',
            amex: '💳'
        };
        return icons[cardType?.toLowerCase()] || '💳';
    };

    const handlePayment = async () => {
        if (!selectedAddress) {
            setErrorModal({ show: true, title: 'Address Required', message: 'Please select a delivery address before proceeding with payment.' });
            return;
        }
        if (!phoneNumber) {
            setErrorModal({ show: true, title: 'Phone Number Required', message: 'Please enter your phone number for delivery updates.' });
            return;
        }

        // Save phone number
        await handleUpdatePhone();

        setProcessing(true);
        setPaymentError('');

        let createdOrderId = null;

        try {
            // Get selected address details
            const address = addresses.find(a => a._id === selectedAddress);

            // Create order data
            const orderData = {
                orderItems: cart.map(item => ({
                    product: item.product._id,
                    name: item.product.name,
                    image: item.product.image,
                    price: item.product.price,
                    qty: item.qty,
                    variant: item.variant
                })),
                shippingAddress: {
                    address: address.street,
                    city: address.city,
                    postalCode: address.postalCode,
                    country: address.country
                },
                paymentMethod: selectedPaymentMethod !== 'new' ? 'SavedCard' : 'Razorpay',
                itemsPrice: getSubtotal(),
                taxPrice: getTax(),
                shippingPrice: getShipping(),
                totalPrice: getTotal()
            };

            // Step 1: Create order in database (Atomic: includes Stock + DB Order + Razorpay Order)
            const orderResult = await store.createOrder(orderData);

            if (!orderResult.success) {
                throw new Error(orderResult.message || 'Failed to create order');
            }

            createdOrderId = orderResult.orderId;
            const trackingNumber = orderResult.trackingNumber;

            // Step 2: Handle Payment Flow
            // If backend didn't return a Razorpay Order ID, assume it's COD or fully paid (e.g. 100% discount)
            if (!orderResult.razorpayOrderId) {
                // COD / Free
                await store.clearCart().catch(() => { });
                // Show success modal directly
                setSuccessModal({ show: true, trackingNumber, orderId: createdOrderId });
                return;
            }

            // Step 3: Open Razorpay checkout using the Order ID created by the backend transaction
            // Retrieve key and config from the order creation response to ensure sync
            const keyId = orderResult.razorpayKeyId || paymentConfig.keyId;
            const merchantName = orderResult.merchantName || paymentConfig.merchantName || 'Epic Threadz';

            const options = {
                key: keyId,
                amount: orderResult.amount,
                currency: orderResult.currency,
                name: merchantName,
                description: `Order #${trackingNumber}`,
                order_id: orderResult.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // Step 5: Verify payment
                        const verifyResult = await store.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: createdOrderId
                        });

                        if (verifyResult.success) {
                            // Step 6: Save card if consent given for new payment methods
                            if (saveCardConsent && selectedPaymentMethod === 'new' && response.razorpay_payment_id) {
                                try {
                                    await store.savePaymentMethod({
                                        token: `tok_${response.razorpay_payment_id}`,
                                        paymentId: response.razorpay_payment_id,
                                        type: 'card',
                                        setDefault: savedMethods.length === 0
                                    });
                                    console.log('Payment method saved successfully');
                                } catch (err) {
                                    console.error('Failed to save card:', err);
                                }
                            }

                            // Show success modal
                            setSuccessModal({ show: true, trackingNumber, orderId: createdOrderId });
                            // Clear cart after successful order
                            await store.clearCart().catch(() => { });
                        } else {
                            setErrorModal({ show: true, title: 'Payment Failed', message: 'Payment verification failed. Please contact support.' });
                        }
                    } catch (err) {
                        console.error('Payment verification error:', err);
                        setErrorModal({ show: true, title: 'Payment Failed', message: 'Payment verification failed. Please contact support.' });
                    }
                    setProcessing(false);
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: phoneNumber
                },
                theme: {
                    color: '#4F46E5'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        // User closed the modal - we keep the order as unpaid so they can retry later
                        setErrorModal({ show: true, title: 'Payment Cancelled', message: 'Payment was cancelled. Your order has been saved - you can complete payment later from your Profile > Orders.' });
                    }
                }
            };

            // If using saved token (logic can be refined if saved tokens need specific prefill)
            // For now, we rely on standard checkout to show saved cards if passing correct customer info

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                setErrorModal({ show: true, title: 'Payment Failed', message: response.error.description || 'Payment failed. Please try again.' });
                setProcessing(false);
            });
            razorpay.open();

        } catch (err) {
            console.error('Order creation failed:', err);

            // Note: We NO LONGER require manual rollback (delete) here.
            // If the backend failed during the transaction (keys invalid, stock out), 
            // the order was never committed to the DB.

            setErrorModal({ show: true, title: 'Order Failed', message: err.message || 'Failed to place order. Please try again.' });
            setProcessing(false);
        }
    };

    const handleRemoveSavedMethod = async (methodId) => {
        if (!confirm('Remove this saved payment method?')) return;
        try {
            await store.removePaymentMethod(methodId);
            setSavedMethods(savedMethods.filter(m => m._id !== methodId));
            if (selectedPaymentMethod === methodId) {
                setSelectedPaymentMethod('new');
            }
        } catch (err) {
            console.error('Failed to remove payment method:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/" className="text-primary-600 hover:underline">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Continue Shopping</span>
                    </Link>
                    <h1 className="text-lg font-bold">Secure Checkout</h1>
                    <div className="flex items-center gap-2 text-primary-600">
                        <Shield size={18} />
                        <span className="text-sm font-medium">SSL Secured</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {paymentError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        {paymentError}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Address, Payment Methods & Phone */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Phone Number */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Phone size={20} className="text-primary-600" />
                                Contact Number
                            </h2>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <MapPin size={20} className="text-primary-600" />
                                    Delivery Address
                                </h2>
                                <button
                                    onClick={() => setShowAddAddress(true)}
                                    className="text-primary-600 hover:text-primary-800 flex items-center gap-1 font-medium text-sm"
                                >
                                    <Plus size={16} /> Add New
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No addresses saved</p>
                                    <button
                                        onClick={() => setShowAddAddress(true)}
                                        className="mt-3 text-primary-600 hover:underline"
                                    >
                                        Add your first address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => setSelectedAddress(addr._id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddress === addr._id
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                                                            {addr.label}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-gray-900">{addr.street}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {addr.city}, {addr.state} {addr.postalCode}
                                                    </p>
                                                </div>
                                                {selectedAddress === addr._id && (
                                                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                                        <Check size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Selection */}
                        {paymentConfig?.keyId && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary-600" />
                                    Payment Method
                                </h2>

                                <div className="space-y-3">
                                    {/* Saved Payment Methods */}
                                    {savedMethods.map((method) => (
                                        <div
                                            key={method._id}
                                            onClick={() => setSelectedPaymentMethod(method._id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedPaymentMethod === method._id
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{method.type === 'card' ? getCardIcon(method.cardType) : '📱'}</span>
                                                    <div>
                                                        {method.type === 'card' ? (
                                                            <>
                                                                <p className="font-medium text-gray-900">
                                                                    {method.cardType?.toUpperCase()} •••• {method.last4}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Expires {method.expiryMonth}/{method.expiryYear}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="font-medium text-gray-900">UPI: {method.vpa}</p>
                                                        )}
                                                    </div>
                                                    {method.isDefault && (
                                                        <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                                            <Star size={10} /> Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveSavedMethod(method._id); }}
                                                        className="text-gray-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    {selectedPaymentMethod === method._id && (
                                                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                                            <Check size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* New Payment Method Option */}
                                    <div
                                        onClick={() => setSelectedPaymentMethod('new')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedPaymentMethod === 'new'
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">➕</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">Pay with new method</p>
                                                    <p className="text-xs text-gray-500">Card, UPI, Net Banking, Wallet</p>
                                                </div>
                                            </div>
                                            {selectedPaymentMethod === 'new' && (
                                                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Save card consent */}
                                    {selectedPaymentMethod === 'new' && (
                                        <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={saveCardConsent}
                                                onChange={(e) => setSaveCardConsent(e.target.checked)}
                                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-600">
                                                Save this payment method for faster checkout
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items - Editable */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Truck size={20} className="text-primary-600" />
                                    Items in Order ({cart.length})
                                </h2>
                                <Link to="/cart" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    Edit Cart
                                </Link>
                            </div>

                            {cart.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <p>Your cart is empty</p>
                                    <Link to="/" className="text-primary-600 font-medium mt-2 inline-block">
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {cart.map((item) => (
                                        <div key={`${item.product._id}-${item.variant?.value || 'default'}`} className="py-4 flex items-center gap-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                                                {item.variant && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {item.variant.type}: <span className="font-medium">{item.variant.value}</span>
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 mt-1">₹{item.product.price} each</p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleUpdateQty(item.product._id, item.qty - 1, item.variant)}
                                                        disabled={item.qty <= 1}
                                                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <span className="text-lg font-medium">−</span>
                                                    </button>
                                                    <span className="w-8 text-center font-semibold text-gray-900">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleUpdateQty(item.product._id, item.qty + 1, item.variant)}
                                                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                                                    >
                                                        <span className="text-lg font-medium">+</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.product._id, item.variant)}
                                                        className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-gray-900">₹{(item.product.price * item.qty).toFixed(0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span>₹{getSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST (18%)</span>
                                    <span>₹{getTax().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={getShipping() === 0 ? 'text-primary-600' : ''}>
                                        {getShipping() === 0 ? 'FREE' : `₹${getShipping()}`}
                                    </span>
                                </div>
                                {getSubtotal() < 500 && (
                                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                        Add ₹{(500 - getSubtotal()).toFixed(0)} more for FREE shipping
                                    </p>
                                )}
                                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing || addresses.length === 0}
                                className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition ${processing || addresses.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700'
                                    }`}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        {selectedPaymentMethod !== 'new' ?
                                            `Pay ₹${getTotal().toFixed(0)} with saved card` :
                                            (paymentConfig?.keyId ? 'Pay with Razorpay' : 'Place Order')
                                        }
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Shield size={14} />
                                    Secure Payment
                                </div>
                                <div className="flex items-center gap-1">
                                    <Truck size={14} />
                                    Fast Delivery
                                </div>
                            </div>

                            {paymentConfig?.keyId && (
                                <div className="mt-4 text-center">
                                    <img
                                        src="https://razorpay.com/assets/footer/razorpay-securepay.png"
                                        alt="Secured by Razorpay"
                                        className="h-6 mx-auto opacity-60"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddAddress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Add New Address</h3>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                <select
                                    value={newAddress.label}
                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    placeholder="123 Main Street, Apt 4B"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.postalCode}
                                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.country}
                                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAddress(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700"
                                >
                                    Add Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-[slideUp_0.3s_ease-out]">
                        {/* Success Header */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s_ease-in-out]">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                            <p className="text-primary-100">Your order has been placed</p>
                        </div>

                        {/* Order Details */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tracking Number</p>
                                        <p className="font-bold text-gray-900 font-mono">{successModal.trackingNumber}</p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        You'll receive tracking updates via email
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setSuccessModal({ show: false, trackingNumber: '', orderId: '' });
                                        navigate('/profile?tab=orders');
                                    }}
                                    className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Package className="w-5 h-5" />
                                    Track My Order
                                </button>
                                <button
                                    onClick={() => {
                                        setSuccessModal({ show: false, trackingNumber: '', orderId: '' });
                                        navigate('/');
                                    }}
                                    className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-[slideUp_0.3s_ease-out]">
                        {/* Error Header */}
                        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{errorModal.title}</h2>
                        </div>

                        {/* Error Details */}
                        <div className="p-6">
                            <p className="text-gray-600 text-center mb-6">{errorModal.message}</p>
                            <button
                                onClick={() => setErrorModal({ show: false, title: '', message: '' })}
                                className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;

