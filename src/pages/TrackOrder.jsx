import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, User } from 'lucide-react';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleTrack = (e) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setTimeout(() => {
            // Check auth
            const userInfo = localStorage.getItem('customerInfo');
            if (userInfo) {
                navigate('/profile?tab=orders');
            } else {
                // Determine if we should show login. 
                // For now, just show message or redirect.
                // We'll redirect to login.
                navigate('/login');
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white font-nunito flex flex-col">
            <div className="max-w-xl mx-auto px-4 py-8 md:py-20 flex-1 w-full">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Store
                </Link>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Package size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Track Your Order</h1>
                    <p className="text-gray-500">Enter your order ID to get real-time updates.</p>
                </div>

                <div className="bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-xl shadow-gray-100/50">
                    <form onSubmit={handleTrack}>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Order ID</label>
                            <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                                    placeholder="e.g. #ORD-123456"
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Checking...
                                </span>
                            ) : (
                                <>
                                    Track Order
                                    <Search size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-4">Don't have an order ID?</p>
                        <Link
                            to={localStorage.getItem('customerInfo') ? "/profile" : "/login"}
                            className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            <User size={16} />
                            View Tracking in My Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;

