import React from 'react';
import { Heart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { siteConfig } from '../site.config';

const ProductCard = ({ product, onAddToCart, onOrderNow, index = 0 }) => {
    // Determine image source
    const displayImage = (product.images && product.images.length > 0)
        ? product.images[0]
        : product.image;

    // Fake member price logic for display
    const memberPrice = Math.floor(product.price * 0.9);

    const navigate = useNavigate();
    const hasSizes = product.variants && product.variants.length > 0;

    return (
        <div
            className="group bg-white flex flex-col h-full relative font-nunito border-b border-r border-gray-100 sm:border-none sm:rounded-xl overflow-hidden product-card"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 image-zoom">
                <Link to={`/product/${product._id}`} className="block w-full h-full">
                    <img
                        src={displayImage || 'https://via.placeholder.com/400x500?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover product-image"
                    />
                </Link>

                {/* Badges */}
                {product.stock < 5 && product.stock > 0 && (
                    <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider pointer-events-none animate-fade-in">
                        Few Left
                    </span>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none backdrop-blur-sm">
                        <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 uppercase">
                            Sold Out
                        </span>
                    </div>
                )}

                {/* Wishlist Icon */}
                <button className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 hover:bg-white hover:scale-110 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100">
                    <Heart size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide truncate pr-2">
                        {siteConfig.name}
                    </h3>
                </div>

                <Link to={`/product/${product._id}`} className="block group-hover:text-primary-600 transition-colors">
                    <h2 className="text-gray-800 text-sm font-medium leading-tight mb-2 line-clamp-2 min-h-[2.5em]">
                        {product.name}
                    </h2>
                </Link>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-2">
                        {/* Show sale price if available, otherwise show regular price */}
                        {product.salePrice && product.salePrice < product.price ? (
                            <>
                                <span className="text-lg font-bold text-gray-900">₹{product.salePrice}</span>
                                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                <span className="text-xs font-bold text-green-600 uppercase">
                                    {product.discountPercent || Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        )}
                    </div>

                    {/* Member Price - only show if there's a sale */}
                    {product.salePrice && product.salePrice < product.price && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-1 rounded-md w-max mb-3">
                            <span className="text-[10px] font-bold text-gray-500">Member Price:</span>
                            <span className="text-xs font-bold text-black">₹{Math.floor(product.salePrice * 0.9)}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => hasSizes ? navigate(`/product/${product._id}`) : onAddToCart(product._id)}
                            disabled={product.stock === 0}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider btn-press
                            ${product.stock > 0
                                    ? 'bg-black text-white shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {hasSizes ? 'Select Variant' : 'Add to Bag'}
                        </button>
                        <button
                            onClick={() => hasSizes ? navigate(`/product/${product._id}`) : onOrderNow(product._id)}
                            disabled={product.stock === 0}
                            className="w-full py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-xs font-bold uppercase rounded-xl hover:from-primary-500 hover:to-primary-600 btn-press shadow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;


