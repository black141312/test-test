import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Package, MapPin, User, ArrowLeft, Trash2, Plus, Phone, LogOut,
    CreditCard, HelpCircle, Edit2, ChevronRight, ShoppingBag, Heart,
    Grid3X3, Settings, Bell, Gift, Wallet, Star
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const Profile = ({ store, user, onLogout }) => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null, trackingNumber: null });
    const [successMessage, setSuccessMessage] = useState('');
    const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
    const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
    const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);
    const [addPaymentType, setAddPaymentType] = useState('card'); // 'card' or 'upi'
    const [deletePaymentDialog, setDeletePaymentDialog] = useState({ open: false, methodId: null, methodName: '' });

    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
    });

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersData, addressData, paymentMethodsData] = await Promise.all([
                store.getOrders(),
                store.getAddresses(),
                store.getSavedPaymentMethods().catch(() => ({ savedMethods: [] }))
            ]);
            setOrders(ordersData.orders || ordersData || []);
            // Handle both array and object response formats
            setAddresses(Array.isArray(addressData) ? addressData : (addressData.addresses || []));
            setPhoneNumber(addressData.phoneNumber || '');
            setProfileData(prev => ({ ...prev, phone: addressData.phoneNumber || '' }));
            setSavedPaymentMethods(paymentMethodsData.savedMethods || paymentMethodsData || []);
        } catch (err) {
            console.error('Failed to fetch profile data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await store.addAddress(newAddress);
            setShowAddAddress(false);
            setNewAddress({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India' });
            fetchData();
        } catch (err) {
            console.error('Failed to add address', err);
        }
    };

    const handleRemoveAddress = async (addressId) => {
        if (!confirm('Are you sure you want to remove this address?')) return;
        try {
            await store.removeAddress(addressId);
            fetchData();
        } catch (err) {
            console.error('Failed to remove address', err);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            // Use proper SDK method
            const result = await store.updateProfile({
                phoneNumber: profileData.phone,
                name: profileData.name
            });

            setSuccessMessage('Details updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Failed to update profile', err);
            setSuccessMessage('Failed to update: ' + err.message);
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    };

    const openCancelDialog = (orderId, trackingNumber) => {
        setCancelDialog({ open: true, orderId, trackingNumber });
    };

    const closeCancelDialog = () => {
        setCancelDialog({ open: false, orderId: null, trackingNumber: null });
    };

    const handleCancelOrder = async () => {
        const orderId = cancelDialog.orderId;
        try {
            const result = await store.cancelOrder(orderId);
            if (result.success) {
                setSuccessMessage('Order cancelled successfully! Your payment will be refunded.');
                setTimeout(() => setSuccessMessage(''), 5000);
                fetchData();
            }
        } catch (err) {
            setSuccessMessage('');
            console.error('Failed to cancel order', err);
        }
    };

    const handleRemovePaymentMethod = async (methodId) => {
        try {
            await store.removePaymentMethod(methodId);
            setSavedPaymentMethods(savedPaymentMethods.filter(m => m._id !== methodId));
            setSuccessMessage('Payment method removed!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Failed to remove payment method', err);
            setSuccessMessage('Failed to remove payment method. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        setDeletePaymentDialog({ open: false, methodId: null, methodName: '' });
    };

    const handleSetDefaultPaymentMethod = async (methodId) => {
        try {
            await store.setDefaultPaymentMethod(methodId);
            setSavedPaymentMethods(savedPaymentMethods.map(m => ({
                ...m,
                isDefault: m._id === methodId
            })));
            setSuccessMessage('Default payment method updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Failed to set default payment method', err);
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

    const handleAddPaymentMethod = async () => {
        setAddingPaymentMethod(true);
        try {
            // Get payment config
            const config = await store.getPaymentConfig();
            if (!config || !config.keyId) {
                setSuccessMessage('Payment gateway not configured. Please contact support.');
                setTimeout(() => setSuccessMessage(''), 3000);
                setShowAddPaymentMethod(false);
                setAddingPaymentMethod(false);
                return;
            }

            // Load Razorpay script if not loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            // Create a ₹1 authorization order
            const order = await store.createPaymentOrder(1, `${addPaymentType}_verification`);

            const paymentMethodLabel = addPaymentType === 'upi' ? 'UPI' : 'Card';

            const options = {
                key: config.keyId,
                amount: order.amount,
                currency: order.currency,
                name: config.merchantName || 'Epic Threadz',
                description: `${paymentMethodLabel} Verification (₹1 will be refunded)`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Verify payment
                        await store.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // Save the payment method - backend will fetch actual details from Razorpay
                        await store.savePaymentMethod({
                            token: `tok_${response.razorpay_payment_id}`,
                            paymentId: response.razorpay_payment_id,
                            type: addPaymentType,
                            setDefault: savedPaymentMethods.length === 0
                        });

                        setSuccessMessage(`${paymentMethodLabel} added successfully! ₹1 will be refunded within 5-7 days.`);
                        setTimeout(() => setSuccessMessage(''), 5000);
                        fetchData(); // Refresh payment methods
                    } catch (err) {
                        console.error('Failed to save payment method:', err);
                        setSuccessMessage('Failed to save payment method. Please try again.');
                        setTimeout(() => setSuccessMessage(''), 3000);
                    }
                    setShowAddPaymentMethod(false);
                    setAddingPaymentMethod(false);
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || ''
                },
                theme: { color: '#4F46E5' },
                modal: {
                    ondismiss: function () {
                        setShowAddPaymentMethod(false);
                        setAddingPaymentMethod(false);
                    }
                }
            };

            // Configure payment method based on selection
            if (addPaymentType === 'upi') {
                options.method = {
                    upi: true,
                    card: false,
                    netbanking: false,
                    wallet: false,
                    paylater: false
                };
            } else {
                options.method = {
                    card: true,
                    upi: false,
                    netbanking: false,
                    wallet: false,
                    paylater: false
                };
            }

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error('Failed to initiate payment:', err);
            setSuccessMessage('Failed to add payment method. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setShowAddPaymentMethod(false);
            setAddingPaymentMethod(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'On the Way': return 'bg-blue-100 text-blue-700';
            case 'In Inventory': return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: Grid3X3 },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'addresses', label: 'My Addresses', icon: MapPin },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    const quickLinks = [
        { label: 'My Orders', desc: 'View, Modify And Track Orders', icon: ShoppingBag, tab: 'orders', color: 'bg-primary-50 text-primary-600' },
        { label: 'My Addresses', desc: 'Edit, Add Or Remove Addresses', icon: MapPin, tab: 'addresses', color: 'bg-blue-50 text-blue-600' },
        { label: 'Payment Methods', desc: 'Manage Your Saved Cards & UPI', icon: CreditCard, tab: 'payments', color: 'bg-green-50 text-green-600' },
        { label: 'My Profile', desc: 'Edit Personal Info And Change Password', icon: User, tab: 'profile', color: 'bg-purple-50 text-purple-600' },
        { label: 'Help & Support', desc: 'Reach Out To Us', icon: HelpCircle, tab: 'help', color: 'bg-gray-50 text-gray-600' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const renderOverview = () => (
        <div className="space-y-6">
            {/* User Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                        {profileData.phone && (
                            <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <Phone size={14} /> {profileData.phone}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary-700 transition"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(link.tab)}
                        className="bg-white rounded-xl p-5 border border-gray-100 hover:border-primary-200 hover:shadow-md transition text-left group"
                    >
                        <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <link.icon size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{link.label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
                    </button>
                ))}
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-primary-600 text-sm hover:underline">
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                        {order.orderItems?.[0]?.image && (
                                            <img src={order.orderItems[0].image} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">
                                            {order.orderItems?.[0]?.name || 'Order'}
                                            {order.orderItems?.length > 1 && ` +${order.orderItems.length - 1} more`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status || 'Processing'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <Package size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-4">Looks like you haven't made any orders yet.</p>
                    <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-700 inline-block">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                                <p className="font-mono font-semibold text-primary-600">
                                    {order.trackingNumber || order._id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status || 'Processing'}
                            </span>
                        </div>

                        {/* Order Items */}
                        {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 py-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                </div>
                                <p className="font-semibold text-gray-900">₹{item.price}</p>
                            </div>
                        ))}

                        {/* Order Footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                            <div className="flex items-center gap-4">
                                <p className="font-bold text-lg">₹{order.totalPrice}</p>
                                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                    <button
                                        onClick={() => openCancelDialog(order._id, order.trackingNumber)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderAddresses = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">My Addresses</h2>
                <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700 flex items-center gap-2"
                >
                    <Plus size={18} /> Add New Address
                </button>
            </div>

            {/* Phone Number */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                    <Phone size={20} className="text-primary-600" />
                    <span className="font-medium text-gray-900">Phone Number</span>
                </div>
                <div className="flex gap-3">
                    <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleUpdateProfile}
                        className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Addresses List */}
            {addresses.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <MapPin size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Addresses Saved</h3>
                    <p className="text-gray-500">Add an address for faster checkout.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div key={addr._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group">
                            <div className="absolute top-4 right-4">
                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                                    {addr.label}
                                </span>
                            </div>
                            <div className="pr-20">
                                <p className="font-medium text-gray-900">{addr.street}</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {addr.city}, {addr.state} {addr.postalCode}
                                </p>
                                <p className="text-gray-500 text-sm">{addr.country}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveAddress(addr._id)}
                                className="mt-4 text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Address Modal */}
            {showAddAddress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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
                                    placeholder="123 Main Street"
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
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Profile</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={profileData.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleUpdateProfile}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition mt-4"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPaymentMethods = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Saved Payment Methods</h2>
                <button
                    onClick={() => setShowAddPaymentMethod(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700 flex items-center gap-2"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            {/* Success/Error Message */}
            {successMessage && (
                <div className={`p-4 rounded-xl ${successMessage.includes('Failed') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                    {successMessage}
                </div>
            )}

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-primary-800">Your payment details are secure</p>
                    <p className="text-sm text-primary-600 mt-0.5">
                        We use industry-standard tokenization. Your actual card numbers and UPI IDs are never stored on our servers.
                    </p>
                </div>
            </div>

            {savedPaymentMethods.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <CreditCard size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods Saved</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Add a card for faster checkout. We'll verify your card with a ₹1 authorization that will be refunded.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setShowAddPaymentMethod(true)}
                            className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-700 inline-flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add Payment Method
                        </button>
                        <Link to="/" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 inline-block">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPaymentMethods.map((method) => (
                        <div key={method._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
                            {/* Default Badge */}
                            {method.isDefault && (
                                <div className="absolute top-4 right-4">
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Star size={10} fill="currentColor" /> Default
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Card Icon */}
                                <div className="w-14 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white text-xl">
                                    {method.type === 'card' ? getCardIcon(method.cardType) : '📱'}
                                </div>

                                <div className="flex-1">
                                    {method.type === 'card' ? (
                                        <>
                                            <p className="font-semibold text-gray-900">
                                                {method.cardNetwork || method.cardType?.toUpperCase() || 'Card'} •••• {method.last4 || '••••'}
                                            </p>
                                            {method.expiryMonth && method.expiryYear ? (
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Expires {method.expiryMonth}/{method.expiryYear}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400 mt-0.5 italic">
                                                    Expiry not available
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-gray-900">UPI</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{method.vpa}</p>
                                        </>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        Added {new Date(method.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                {!method.isDefault && (
                                    <button
                                        onClick={() => handleSetDefaultPaymentMethod(method._id)}
                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Star size={14} /> Set as Default
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeletePaymentDialog({
                                        open: true,
                                        methodId: method._id,
                                        methodName: method.type === 'upi'
                                            ? `UPI (${method.vpa})`
                                            : `${method.cardNetwork || 'Card'} •••• ${method.last4 || '••••'}`
                                    })}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 ml-auto"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info about saved payment methods */}
            <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-2">About Saved Payment Methods</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Your payment credentials are securely tokenized and encrypted</li>
                    <li>• We never store your full card number or CVV</li>
                    <li>• You may still need to verify with OTP as per RBI guidelines</li>
                    <li>• Remove a payment method anytime from this page</li>
                </ul>
            </div>

            {/* Add Payment Method Modal */}
            {
                showAddPaymentMethod && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Add Payment Method</h3>

                            {/* Payment Type Selection */}
                            <div className="flex gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setAddPaymentType('card')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${addPaymentType === 'card'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addPaymentType === 'card' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <span className={`font-medium ${addPaymentType === 'card' ? 'text-primary-600' : 'text-gray-700'}`}>
                                            Card
                                        </span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddPaymentType('upi')}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${addPaymentType === 'upi'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addPaymentType === 'upi' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10.5 13.5L7.5 10.5L6 12L10.5 16.5L18 9L16.5 7.5L10.5 13.5Z" />
                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
                                            </svg>
                                        </div>
                                        <span className={`font-medium ${addPaymentType === 'upi' ? 'text-primary-600' : 'text-gray-700'}`}>
                                            UPI
                                        </span>
                                    </div>
                                </button>
                            </div>

                            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-primary-900">How it works</p>
                                        <ul className="text-sm text-primary-800 mt-2 space-y-1">
                                            <li>• We'll charge ₹1 to verify your {addPaymentType === 'upi' ? 'UPI ID' : 'card'}</li>
                                            <li>• This amount will be refunded within 5-7 days</li>
                                            <li>• Your {addPaymentType === 'upi' ? 'UPI ID' : 'card'} will be saved for faster checkout</li>
                                            {addPaymentType === 'card' && <li>• You may need to enter OTP for verification</li>}
                                            {addPaymentType === 'upi' && <li>• Approve the request in your UPI app</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddPaymentMethod(false);
                                        setAddPaymentType('card');
                                    }}
                                    disabled={addingPaymentMethod}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddPaymentMethod}
                                    disabled={addingPaymentMethod}
                                    className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {addingPaymentMethod ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {addPaymentType === 'upi' ? (
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M10.5 13.5L7.5 10.5L6 12L10.5 16.5L18 9L16.5 7.5L10.5 13.5Z" />
                                                </svg>
                                            ) : (
                                                <CreditCard size={18} />
                                            )}
                                            Add {addPaymentType === 'upi' ? 'UPI' : 'Card'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Payment Method Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deletePaymentDialog.open}
                onClose={() => setDeletePaymentDialog({ open: false, methodId: null, methodName: '' })}
                onConfirm={() => handleRemovePaymentMethod(deletePaymentDialog.methodId)}
                title="Remove Payment Method"
                message={`Are you sure you want to remove "${deletePaymentDialog.methodName}"? This action cannot be undone.`}
                confirmText="Remove"
                cancelText="Keep it"
                variant="danger"
            />
        </div >
    );

    const renderHelp = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Help & Support</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center py-8">
                    <HelpCircle size={64} className="mx-auto mb-4 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Our customer support team is here to help you with any questions or concerns.
                    </p>

                    {/* Contact Information */}
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        {/* Email */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-primary-600">
                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email Us</p>
                                <a href="mailto:support@epicthreadz.com" className="text-gray-900 font-semibold hover:text-primary-600 transition">
                                    support@epicthreadz.com
                                </a>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Phone size={24} className="text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Call Us</p>
                                <a href="tel:+911234567890" className="text-gray-900 font-semibold hover:text-green-600 transition">
                                    +91 123 456 7890
                                </a>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-6">
                        Available Monday - Saturday, 10:00 AM - 6:00 PM IST
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
                    {successMessage}
                </div>
            )}

            {/* Cancel Dialog */}
            <ConfirmDialog
                isOpen={cancelDialog.open}
                onClose={closeCancelDialog}
                onConfirm={handleCancelOrder}
                title="Cancel Order"
                message={`Are you sure you want to cancel order #${cancelDialog.trackingNumber || cancelDialog.orderId?.slice(-8).toUpperCase()}? This action cannot be undone.`}
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
            />

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Shop</span>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">My Account</h1>
                    <button
                        onClick={onLogout}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full px-5 py-4 flex items-center gap-3 text-left transition border-l-4 ${activeTab === item.id
                                        ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                            <div className="border-t border-gray-100">
                                <button
                                    onClick={onLogout}
                                    className="w-full px-5 py-4 flex items-center gap-3 text-left text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut size={20} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'orders' && renderOrders()}
                        {activeTab === 'addresses' && renderAddresses()}
                        {activeTab === 'payments' && renderPaymentMethods()}
                        {activeTab === 'profile' && renderProfile()}
                        {activeTab === 'help' && renderHelp()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

