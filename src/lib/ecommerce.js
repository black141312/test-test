import EpicMerch from 'epicmerch';

/**
 * EcommerceService - A wrapper around the EpicMerch SDK
 * allowing for easier maintenance, mocking, and centralized logic.
 */
class EcommerceService {
    constructor() {
        this.sdk = new EpicMerch({
            apiKey: import.meta.env.VITE_EPIC_MERCH_API_KEY,
            onAuthError: () => {
                this.handleAuthError();
            },
            ...(import.meta.env.VITE_EPIC_MERCH_API_URL && { baseUrl: import.meta.env.VITE_EPIC_MERCH_API_URL })
        });
    }

    handleAuthError() {
        localStorage.removeItem('customerInfo');
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    setToken(token) {
        this.sdk.setCustomerToken(token);
    }

    clearToken() {
        this.sdk.clearCustomerToken();
    }

    // --- PRODUCTS ---
    async getProducts(params = {}) {
        return await this.sdk.products.list(params);
    }

    async getProduct(id) {
        return await this.sdk.products.get(id);
    }

    async searchProducts(query, options = {}) {
        return await this.sdk.products.search(query, options);
    }

    async getCategories() {
        return await this.sdk.categories.list();
    }

    // --- CART ---
    async getCart() {
        return await this.sdk.cart.get();
    }

    async addToCart(productId, quantity = 1, variant = null) {
        return await this.sdk.cart.add(productId, quantity, variant);
    }

    async updateCartItem(itemId, quantity) {
        return await this.sdk.cart.update(itemId, quantity);
    }

    async removeFromCart(itemId) {
        return await this.sdk.cart.remove(itemId);
    }

    async clearCart() {
        return await this.sdk.cart.clear();
    }

    // --- AUTH (Legacy + New OTP/OAuth) ---
    // Legacy Email/Password
    async login(email, password) {
        return await this.sdk.users.login(email, password);
    }

    async register(name, email, password) {
        return await this.sdk.users.register(name, email, password);
    }

    // OTP Auth
    async sendOtp(identifier, method = 'phone') {
        return await this.sdk.auth.sendOtp(identifier, method);
    }

    async verifyOtp(identifier, otp, profile = {}) {
        return await this.sdk.auth.verifyOtp(identifier, otp, profile);
    }

    // OAuth
    getGoogleAuthUrl(redirectUrl) {
        return this.sdk.auth.getGoogleAuthUrl(redirectUrl);
    }

    async handleOAuthCallback() {
        return await this.sdk.auth.handleOAuthCallback();
    }

    async verifyFirebaseToken(idToken, profile = {}) {
        return await this.sdk.auth.verifyFirebaseToken(idToken, profile);
    }

    // Session Management
    async getSession() {
        return await this.sdk.auth.getSession();
    }

    async refreshToken() {
        return await this.sdk.auth.refreshToken();
    }

    async logout() {
        return this.sdk.auth.logout();
    }

    // --- CUSTOMER PROFILE & ADDRESSES ---
    async getProfile() {
        return await this.sdk.customer.getProfile();
    }

    async updateProfile(data) {
        return await this.sdk.customer.updateProfile(data);
    }

    async getAddresses() {
        return await this.sdk.addresses.list();
    }

    async addAddress(address) {
        return await this.sdk.addresses.add(address);
    }

    async removeAddress(id) {
        return await this.sdk.addresses.remove(id);
    }

    async updatePhone(phoneNumber) {
        return await this.sdk.addresses.updatePhone(phoneNumber);
    }

    // --- ORDERS ---
    async createOrder(orderData, options = {}) {
        return await this.sdk.orders.create(orderData, options);
    }

    async getOrders() {
        return await this.sdk.orders.list();
    }

    async getOrder(orderId) {
        return await this.sdk.orders.get(orderId);
    }

    async cancelOrder(orderId, options = {}) {
        return await this.sdk.orders.cancel(orderId, options);
    }

    async deleteOrder(orderId) {
        return await this.sdk.orders.delete(orderId);
    }

    calculateTotal(items) {
        return this.sdk.orders.calculateTotal(items);
    }

    // --- PAYMENT ---
    async getPaymentConfig() {
        return await this.sdk.payment.getConfig();
    }

    async createPaymentOrder(amount, orderId, options = {}) {
        return await this.sdk.payment.createOrder(amount, orderId, options);
    }

    async verifyPayment(paymentData) {
        return await this.sdk.payment.verify(paymentData);
    }

    async getSavedPaymentMethods() {
        return await this.sdk.payment.getSavedMethods();
    }

    async savePaymentMethod(methodData, options = {}) {
        return await this.sdk.payment.saveMethod(methodData, options);
    }

    async removePaymentMethod(methodId) {
        return await this.sdk.payment.removeMethod(methodId);
    }

    async setDefaultPaymentMethod(methodId) {
        return await this.sdk.payment.setDefault(methodId);
    }

    async chargeSavedMethod(methodId, amount, orderId, options = {}) {
        return await this.sdk.payment.chargeSaved(methodId, amount, orderId, options);
    }

    // --- NEWSLETTER ---
    async subscribeToNewsletter(email, name = '') {
        return await this.sdk.newsletter.subscribe(email, name);
    }

    // --- NOTIFICATIONS ---
    async sendNotificationToMe(subject, message, type = 'email') {
        return await this.sdk.notifications.sendToMe({ subject, message, type });
    }

    async sendNotification(to, subject, message, htmlContent, type = 'email') {
        return await this.sdk.notifications.send({ to, subject, message, htmlContent, type });
    }

    async getAbandonedCarts(hours) {
        return await this.sdk.notifications.getAbandonedCarts(hours);
    }

    async notifyAbandonedCarts(subject, message, type = 'email', hours = 24) {
        return await this.sdk.notifications.notifyAbandonedCarts({ subject, message, type, hours });
    }

    // --- ANALYTICS ---
    async trackEvent(event) {
        return await this.sdk.analytics.track(event);
    }

    // --- Legacy Compatibility Mode / Direct Access ---
    get auth() { return this.sdk.auth; } // Note: 'login' is on 'users' in SDK
    get users() { return this.sdk.users; }
    get products() { return this.sdk.products; }
    get cart() { return this.sdk.cart; }
    get newsletter() { return this.sdk.newsletter; }
    get orders() { return this.sdk.orders; } // SDK uses 'orders', not 'checkout'
    get checkout() { return this.sdk.orders; } // Alias for compat if needed
    get categories() { return this.sdk.categories; }
    get customer() { return this.sdk.customer; }
    get customers() { return this.sdk.customer; } // Alias
    get addresses() { return this.sdk.addresses; }
    get payment() { return this.sdk.payment; }
    get notifications() { return this.sdk.notifications; }
    get analytics() { return this.sdk.analytics; }
}

// Export a singleton instance
export const ecommerce = new EcommerceService();

