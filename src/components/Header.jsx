import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, TrendingUp } from 'lucide-react';
import { store } from '../App';
import { siteConfig } from '../site.config';

const Header = ({
    user,
    onLogout,
    cartCount,
    onCartOpen,
    categories = [],
    activeCategory = '',
    onCategoryChange = () => { },
    onSearch,
    searchInput: externalSearchInput,
    setSearchInput: externalSetSearchInput
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [localSearchInput, setLocalSearchInput] = useState('');
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const navigate = useNavigate();

    // Use external search state if provided, otherwise use local state
    const searchInput = externalSearchInput !== undefined ? externalSearchInput : localSearchInput;
    const setSearchInput = externalSetSearchInput || setLocalSearchInput;
    const isSearchEnabled = typeof onSearch === 'function';

    // Debounce search suggestions - always show suggestions when typing
    useEffect(() => {
        if (!searchInput || !searchInput.trim() || searchInput.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                // Using the dedicated search method
                const data = await store.searchProducts(searchInput.trim(), {
                    limit: 5
                });
                setSuggestions(data.products || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchInput]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideDesktop = !searchRef.current || !searchRef.current.contains(event.target);
            const isOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(event.target);
            if (isOutsideDesktop && isOutsideMobile) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput && searchInput.trim() && isSearchEnabled) {
            onSearch(searchInput.trim());
            setShowSuggestions(false);
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        if (isSearchEnabled) {
            onSearch('');
        }
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (productId) => {
        setShowSuggestions(false);
        setSearchInput('');
        navigate(`/product/${productId}`);
    };

    // Suggestion dropdown component
    const SearchSuggestions = ({ suggestions, isLoading }) => {
        if (!showSuggestions) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Searching...
                    </div>
                ) : suggestions.length > 0 ? (
                    <>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <TrendingUp size={12} />
                            Suggestions
                        </div>
                        {suggestions.map((product) => (
                            <button
                                key={product._id}
                                onClick={() => handleSuggestionClick(product._id)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-none"
                            >
                                <img
                                    src={product.images?.[0] || product.image || 'https://via.placeholder.com/50'}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.type}</p>
                                </div>
                                <div className="text-sm font-bold text-primary-600">₹{product.price}</div>
                            </button>
                        ))}
                        <button
                            onClick={(e) => {
                                if (isSearchEnabled) {
                                    handleSearch(e);
                                } else {
                                    // Navigate to home page - the search will need to be done there
                                    navigate('/');
                                    setShowSuggestions(false);
                                }
                            }}
                            className="w-full py-3 text-center text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                            {isSearchEnabled ? `See all results for "${searchInput}"` : 'Go to Home to search'}
                        </button>
                    </>
                ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No products found for "{searchInput}"
                    </div>
                )}
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm font-nunito">

            {/* Main Navbar */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">

                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-700"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div
                            onClick={() => {
                                onCategoryChange('All');
                                navigate('/');
                            }}
                            className="flex items-center gap-2 group cursor-pointer"
                        >
                            {/* ET Logo Image */}
                            <img
                                src="/logo.png"
                                alt="Epic Threadz"
                                className="w-10 h-10 md:w-12 md:h-12 object-contain transform -rotate-6 group-hover:rotate-0 transition-transform duration-300"
                            />
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{siteConfig.name}</span>
                            </div>
                        </div>

                        {/* Desktop Categories */}
                        <nav className="hidden md:flex items-center ml-8 gap-6">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => onCategoryChange(cat)}
                                    className={`text-sm font-bold uppercase tracking-wide transition-colors relative py-6
                                        ${activeCategory === cat ? 'text-black' : 'text-gray-500 hover:text-black'}
                                    `}
                                >
                                    {cat}
                                    {activeCategory === cat && (
                                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-500"></span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-6 relative">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by product name..."
                                className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary-500 transition-shadow"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onFocus={() => searchInput.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </form>
                        <SearchSuggestions suggestions={suggestions} isLoading={isLoadingSuggestions} />
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-1">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors"
                                >
                                    <span className="text-xs font-bold text-primary-800 hidden md:block">Hi, {user.name.split(' ')[0]}</span>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-primary-200" />
                                    ) : (
                                        <User size={18} className="text-primary-700" />
                                    )}
                                </Link>
                                <button onClick={onLogout} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-black border-r border-gray-300 pr-4 mr-1 hidden md:block">
                                Login
                            </Link>
                        )}

                        <button className="p-2 hover:bg-gray-100 rounded-full relative group">
                            <Heart size={20} className="text-gray-700 group-hover:text-red-500 transition-colors" />
                        </button>

                        <button onClick={onCartOpen} className="p-2 hover:bg-gray-100 rounded-full relative">
                            <ShoppingBag size={20} className="text-gray-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div ref={mobileSearchRef} className="md:hidden px-4 pb-3 relative">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-10 pr-10 text-sm focus:ring-1 focus:ring-primary-500"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onFocus={() => searchInput.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                    <SearchSuggestions suggestions={suggestions} isLoading={isLoadingSuggestions} />
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen z-50 overflow-y-auto pb-20">
                    <div className="p-4 grid gap-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shop By Category</h3>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    onCategoryChange(cat);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`text-left px-4 py-3 rounded-lg font-bold ${activeCategory === cat ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {!user && (
                        <div className="p-4 border-t border-gray-100">
                            <Link to="/login" className="block w-full text-center bg-primary-500 text-white font-bold py-3 rounded-lg hover:bg-primary-600">
                                Login / Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;

