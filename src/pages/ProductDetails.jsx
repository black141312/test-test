import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingBag, Truck, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import Header from '../components/Header';

const ProductDetails = ({ store, user, onLogout, cartCount, onCartOpen, onAddToCart, onOrderNow }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [showVariantWarning, setShowVariantWarning] = useState(false);

    // Auto-select VARIANT_NOT_REQUIRED if present
    useEffect(() => {
        if (product && product.variants) {
            const notReq = product.variants.find(s => s.variant === 'VARIANT_NOT_REQUIRED');
            if (notReq) {
                setSelectedVariant('VARIANT_NOT_REQUIRED');
            }
        }
    }, [product]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Determine if SDK or direct fetch
                // Assuming SDK has a simple get method or we fallback to axios
                // If SDK isn't documented, we can try to guess or use the public API URL
                // The storefront in App.jsx initialized store with baseUrl

                // Let's try to use the SDK list and filter if getById isn't obvious, 
                // OR better, explicit fetch to the API endpoint constructed from store config if accessible.
                // Assuming store.products.get(id) exists based on common patterns.

                // Use SDK to fetch product (handles authentication and tenant headers)
                const data = await store.getProduct(id);
                setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
            </div>
        );
    }

    if (!product) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Product not found</div>;
    }

    // Prepare images array
    const images = (product.images && product.images.length > 0) ? product.images : [product.image];
    // Fake member price
    const memberPrice = Math.floor(product.price * 0.9);

    return (
        <div className="bg-white min-h-screen font-nunito pb-20 md:pb-0">
            <Header
                user={user}
                onLogout={onLogout}
                cartCount={cartCount}
                onCartOpen={onCartOpen}
                categories={[]} // Hide categories or pass them if available
                activeCategory=""
                onCategoryChange={() => navigate('/')}
            />

            <div className="max-w-7xl mx-auto px-0 md:px-4 lg:px-8 py-0 md:py-8">
                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 mb-6 px-4">
                    <span className="cursor-pointer hover:text-black">Home</span>
                    <ChevronRight size={14} />
                    <span className="cursor-pointer hover:text-black">{product.type}</span>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 md:gap-8 lg:gap-12">
                    {/* Left Column - Images */}
                    <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
                        {/* Thumbnails (Desktop) */}
                        <div className="hidden md:flex flex-col gap-4 w-20 sticky top-24 h-max">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-full aspect-[3/4] cursor-pointer border-2 rounded-md overflow-hidden transition-all
                                        ${selectedImage === idx ? 'border-primary-400 ring-1 ring-primary-400' : 'border-transparent hover:border-gray-300'}
                                    `}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative bg-gray-50 md:rounded-xl overflow-hidden aspect-[3/4] md:aspect-auto md:min-h-[600px]">
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 md:hidden">
                                <Heart size={20} className="text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-5 px-4 pt-6 md:pt-0">
                        {/* Brand & Title */}
                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-1">Epic Threadz</h3>
                        <h1 className="text-xl md:text-2xl font-medium text-gray-900 text-opacity-90 leading-snug mb-3">
                            {product.name}
                        </h1>

                        {/* Ratings */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">
                                4.5 <Star size={10} className="fill-black ml-1" />
                            </div>
                            <span className="text-xs text-gray-500 underline cursor-pointer">458 ratings</span>
                        </div>

                        {/* Price Box */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3 mb-2">
                                {/* Show sale price if available, otherwise show regular price */}
                                {product.salePrice && product.salePrice < product.price ? (
                                    <>
                                        <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{product.salePrice}</span>
                                        <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                                        <span className="text-base font-bold text-primary-600">
                                            {product.discountPercent || Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{product.price}</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">inclusive of all taxes</div>

                            {/* TriBe Box - Only show if there's a sale */}
                            {product.salePrice && product.salePrice < product.price && (
                                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold">TriBe members get an extra discount</p>
                                        <p className="text-xs text-gray-500">Member Price: <span className="font-bold text-black">₹{Math.floor(product.salePrice * 0.9)}</span></p>
                                    </div>
                                    <button className="text-xs font-bold text-primary-600 uppercase">Join Now</button>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-200 w-full mb-6"></div>

                        {/* Variant Selector */}
                        {product.variants && product.variants.length > 0 && !product.variants.some(s => s.variant === 'VARIANT_NOT_REQUIRED') && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-sm uppercase">Variants</span>
                                    <span className="text-xs text-primary-600 font-bold cursor-pointer">Size Guide</span>
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    {product.variants.map(item => (
                                        <button
                                            key={item.variant}
                                            onClick={() => setSelectedVariant(item.variant)}
                                            disabled={item.stock <= 0}
                                            className={`h-12 min-w-[3rem] px-4 rounded-lg border flex items-center justify-center text-sm font-bold transition-all
                                                    ${selectedVariant === item.variant
                                                    ? 'bg-black text-white border-black shadow-lg scale-105'
                                                    : (item.stock > 0 ? 'bg-white text-gray-700 border-gray-300 hover:border-black' : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed')}
                                                `}
                                        >
                                            {item.variant}
                                        </button>
                                    ))}
                                </div>
                                {showVariantWarning && (
                                    <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">⚠️ Please select a variant before adding to cart</p>
                                )}
                            </div>
                        )}

                        {/* Desktop Actions */}
                        <div className="hidden md:flex gap-4 mb-8">
                            <button
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login');
                                        return;
                                    }
                                    if (product.variants?.length > 0 && !selectedVariant) {
                                        setShowVariantWarning(true);
                                        return;
                                    }
                                    setShowVariantWarning(false);
                                    onAddToCart(product._id, selectedVariant);
                                }}
                                disabled={product.stock === 0}
                                className="flex-1 bg-primary-500 text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <ShoppingBag size={20} />
                                Add to Bag
                            </button>
                            <button className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-md font-bold uppercase tracking-widest hover:border-black transition-colors flex items-center justify-center gap-2">
                                <Heart size={20} />
                                Wishlist
                            </button>
                        </div>

                        {/* Product Description */}
                        <div className="mb-8">
                            <button className="w-full flex justify-between items-center py-4 border-b border-gray-100">
                                <span className="font-bold text-sm uppercase">Product Description</span>
                                <ChevronRight size={16} />
                            </button>
                            <div className="py-4 text-sm text-gray-600 leading-relaxed">
                                <p className="mb-4">{product.description || "Premium quality streetwear designed for the modern generation. Made with 100% cotton for maximum comfort."}</p>

                                <h4 className="font-bold text-black mb-2">Key Features:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Premium Cotton Fabric</li>
                                    <li>Relaxed / Oversized Fit</li>
                                    <li>High Definition Graphics</li>
                                    <li>Machine Washable</li>
                                </ul>
                            </div>
                        </div>

                        {/* Secure Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-lg">
                            <div className="text-center">
                                <Truck size={24} className="mx-auto text-gray-400 mb-1" />
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Fast Delivery</p>
                            </div>
                            <div className="text-center border-l border-gray-200">
                                <ShieldCheck size={24} className="mx-auto text-gray-400 mb-1" />
                                <p className="text-[10px] text-gray-500 font-bold uppercase">100% Genuine</p>
                            </div>
                            <div className="text-center border-l border-gray-200">
                                <RefreshCw size={24} className="mx-auto text-gray-400 mb-1" />
                                <p className="text-[10px] text-gray-500 font-bold uppercase">15 Days Return</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 flex gap-2 md:hidden z-40">
                <button className="flex-1 border border-gray-300 rounded text-sm font-bold uppercase py-3">
                    Wishlist
                </button>
                <button
                    onClick={() => {
                        if (!user) {
                            navigate('/login');
                            return;
                        }
                        if (product.variants?.length > 0 && !selectedVariant) {
                            setShowVariantWarning(true);
                            return;
                        }
                        setShowVariantWarning(false);
                        onAddToCart(product._id, selectedVariant);
                    }}
                    disabled={product.stock === 0}
                    className="flex-1 bg-primary-500 text-white rounded text-sm font-bold uppercase py-3 shadow-md disabled:opacity-50"
                >
                    Add to Bag
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;

