import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { store } from '../App';

// Generate or retrieve session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('epicmerch_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('epicmerch_session_id', sessionId);
    }
    return sessionId;
};

// Track page views automatically
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const trackPageView = async () => {
            try {
                const sessionId = getSessionId();
                await store.trackEvent({
                    eventType: 'page_view',
                    url: location.pathname,
                    sessionId
                });
            } catch (error) {
                // Silently fail - analytics should never break the UI
                console.debug('Analytics tracking failed:', error.message);
            }
        };

        trackPageView();
    }, [location.pathname]);
};

// Track product views
export const trackProductView = async (productId, productName) => {
    try {
        const sessionId = getSessionId();
        await store.trackEvent({
            eventType: 'product_view',
            productId,
            productName,
            url: `/product/${productId}`,
            sessionId
        });
    } catch (error) {
        console.debug('Product view tracking failed:', error.message);
    }
};

// Track add to cart
export const trackAddToCart = async (productId, productName, quantity = 1) => {
    try {
        const sessionId = getSessionId();
        await store.trackEvent({
            eventType: 'add_to_cart',
            productId,
            productName,
            quantity,
            sessionId
        });
    } catch (error) {
        console.debug('Add to cart tracking failed:', error.message);
    }
};

// Track checkout
export const trackCheckout = async (cartTotal, itemCount) => {
    try {
        const sessionId = getSessionId();
        await store.trackEvent({
            eventType: 'checkout',
            cartTotal,
            itemCount,
            sessionId
        });
    } catch (error) {
        console.debug('Checkout tracking failed:', error.message);
    }
};

// Track purchase
export const trackPurchase = async (orderId, orderTotal, items) => {
    try {
        const sessionId = getSessionId();
        await store.trackEvent({
            eventType: 'purchase',
            orderId,
            orderTotal,
            itemCount: items?.length || 0,
            sessionId
        });
    } catch (error) {
        console.debug('Purchase tracking failed:', error.message);
    }
};

export default { usePageTracking, trackProductView, trackAddToCart, trackCheckout, trackPurchase };

