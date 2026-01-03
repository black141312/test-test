import React, { useEffect, useState } from 'react';
import EpicMerch from 'epicmerch';
import { ShoppingBag, Star, Menu, ShoppingCart, User, LogOut, Instagram, Twitter, Facebook } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import CartSlider from './components/CartSlider';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import ProductDetails from './pages/ProductDetails';
import { About, Terms, Privacy, ReturnPolicy, Blog } from './pages/FooterPages';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import { usePageTracking } from './hooks/useAnalytics';

import { ecommerce } from './lib/ecommerce';
import { siteConfig } from './site.config';
import { applyTheme } from './lib/themes';

// Initialize SDK is now handled in lib/ecommerce.js
// We use the 'ecommerce' singleton instance throughout the app
export const store = ecommerce;

const Storefront = ({ user, onLogout, cartCount, onCartOpen, onAddToCart, onOrderNow, categories = ['All'] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState({ loading: false, message: '' });
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;

    setSubscribeStatus({ loading: true, message: '' });
    try {
      const result = await ecommerce.subscribeToNewsletter(subscribeEmail);
      setSubscribeStatus({ loading: false, message: result.message || 'Subscribed!' });
      setSubscribeEmail('');
      setTimeout(() => setSubscribeStatus({ loading: false, message: '' }), 3000);
    } catch (error) {
      setSubscribeStatus({ loading: false, message: error.message || 'Failed to subscribe' });
    }
  };

  // Track page views
  usePageTracking();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          type: activeCategory === 'All' ? undefined : activeCategory,
          page: page,
          limit: 12,
          sort: sortBy
        };

        // Add search keyword if present
        if (searchQuery.trim()) {
          params.keyword = searchQuery.trim();
        }

        const data = await ecommerce.getProducts(params);
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, page, searchQuery, sortBy]);

  const handleCategoryChange = (cat) => {
    setPage(1);
    setSearchQuery(''); // Clear search when changing category
    setSearchInput('');
    setActiveCategory(cat);
  };

  const handleSearch = (query) => {
    setPage(1);
    setSearchQuery(query);
    setActiveCategory('All'); // Search across all categories
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await onAddToCart(productId);
  };

  const handleOrderNow = async (productId, variant) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await onOrderNow(productId, variant);
  };

  return (
    <div className="min-h-screen bg-white font-nunito">

      <Header
        user={user}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartOpen={onCartOpen}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />

      <HeroSlider />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Category Header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {searchQuery
                ? `Search: "${searchQuery}"`
                : activeCategory === 'All'
                  ? 'Latest Drops'
                  : activeCategory}
            </h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              {total} {total === 1 ? 'Item' : 'Items'} Found
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchInput(''); }}
                  className="ml-3 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Clear Search
                </button>
              )}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-none bg-transparent font-bold text-black focus:ring-0 cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 md:gap-6 border-t border-l border-gray-100 md:border-none">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  onAddToCart={handleAddToCart}
                  onOrderNow={async (productId, variant) => {
                    // handleOrderNow checks for user and navigates to login if needed
                    await handleOrderNow(productId, variant);
                    // Only navigate to checkout if user is logged in
                    if (user) {
                      navigate('/checkout');
                    }
                  }}
                />
              ))}
            </div>

            {/* Empty State */}
            {products.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-xl">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No products found</h3>
                <p className="text-gray-500">Check back later for new drops!</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all
                            ${page === p
                    ? 'bg-black text-white shadow-lg scale-110'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
              >
                {p}
              </button>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-primary-500 font-black text-2xl uppercase tracking-tighter mb-6">{siteConfig.name}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {siteConfig.description}
              </p>
              <div className="mt-6 flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
              </div>

            </div>


            <div>
              <h5 className="font-bold text-primary-500 uppercase tracking-widest text-xs mb-6">Customer Service</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/track-order" className="hover:text-white transition">Track Order</Link></li>
                <li><Link to="/return-policy" className="hover:text-white transition">Return Policy</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Cancel Order</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-primary-500 uppercase tracking-widest text-xs mb-6">Company</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-primary-500 uppercase tracking-widest text-xs mb-6">Stay in the Loop</h5>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-gray-900 border-none text-white px-4 py-2 rounded-l-lg w-full focus:ring-1 focus:ring-primary-500 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeStatus.loading}
                  className="bg-primary-500 text-white px-4 py-2 rounded-r-lg font-bold uppercase text-xs hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {subscribeStatus.loading ? '...' : 'Subscribe'}
                </button>
              </form>
              {subscribeStatus.message && (
                <p className="text-primary-500 text-sm mt-2">{subscribeStatus.message}</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </div>
        </div>
      </footer >
    </div >
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState(['All']);

  // Fetch categories once on app load
  useEffect(() => {
    // Apply theme from config
    applyTheme(siteConfig.theme);

    const fetchCategories = async () => {
      try {
        console.log(`[${siteConfig.name}] Fetching categories from App...`);
        const cats = await ecommerce.getCategories();
        console.log(`[${siteConfig.name}] Categories received:`, cats);
        setCategories(cats);
      } catch (err) {
        console.error('[Epic Threadz] Failed to fetch categories:', err);
        // Keep default categories on error
      }
    };
    fetchCategories();
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('customerInfo');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Set token in SDK
      if (userData.token) {
        ecommerce.setToken(userData.token);
      }

      // Fetch cart count
      fetchCartCount();
    }
  }, []);

  // Auto-refresh token every 25 minutes (tokens expire in 30 min)
  useEffect(() => {
    if (!user?.token) return;

    const refreshToken = async () => {
      try {
        console.log(`[${siteConfig.name}] Refreshing token...`);
        const data = await ecommerce.refreshToken();

        // Update stored token
        const storedUser = localStorage.getItem('customerInfo');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.token = data.token;
          localStorage.setItem('customerInfo', JSON.stringify(userData));
          console.log(`[${siteConfig.name}] Token refreshed successfully`);
        }
      } catch (err) {
        console.error(`[${siteConfig.name}] Token refresh failed:`, err);
        // Token refresh failed - user might need to re-login
        // The onAuthError callback will handle 401 errors
      }
    };

    // Refresh every 25 minutes (25 * 60 * 1000 = 1,500,000 ms)
    const interval = setInterval(refreshToken, 25 * 60 * 1000);

    // Also refresh once on load if token exists (to extend from last session)
    refreshToken();

    return () => clearInterval(interval);
  }, [user?.token]);

  const fetchCartCount = async () => {
    try {
      const data = await ecommerce.getCart();
      setCartCount(data.cart?.length || 0);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerInfo');
    ecommerce.clearToken();
    setUser(null);
    setCartCount(0);
    window.location.href = '/';
  };

  const handleAddToCart = async (productId, variant) => {
    try {
      await ecommerce.addToCart(productId, 1, variant);
      // Wait a bit for state to update then refresh
      setTimeout(() => {
        setCartOpen(true); // Changed from handleCartOpen() to setCartOpen(true)
        // Ideally we fetch cart count
        fetchCartCount();
      }, 500);
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  const handleOrderNow = async (productId, variant, navigateFn) => {
    if (!user) {
      // If navigateFn is provided, use it (from child component)
      // Otherwise the child component should handle redirect
      return false;
    }
    try {
      await ecommerce.addToCart(productId, 1, variant);
      fetchCartCount();
      return true; // Success - let caller handle navigation
    } catch (err) {
      console.error('Failed to add to cart', err);
      return false;
    }
  };

  return (
    <Router>
      {/* Cart Slider */}
      <CartSlider
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        store={store}
        onCartUpdate={fetchCartCount}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Storefront
              user={user}
              onLogout={handleLogout}
              cartCount={cartCount}
              onCartOpen={() => setCartOpen(true)}
              onAddToCart={handleAddToCart}
              onOrderNow={handleOrderNow}
              categories={categories}
            />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetails
              store={store}
              user={user}
              onLogout={handleLogout}
              cartCount={cartCount}
              onCartOpen={() => setCartOpen(true)}
              onAddToCart={handleAddToCart}
              onOrderNow={handleOrderNow}
            />
          }
        />
        <Route path="/login" element={<Login store={store} />} />
        <Route path="/register" element={<Register store={store} />} />
        <Route path="/checkout" element={<Checkout store={store} user={user} />} />
        <Route
          path="/profile"
          element={
            <Profile
              store={store}
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track-order" element={<TrackOrder />} />
      </Routes>
    </Router>
  );
}

export default App;

