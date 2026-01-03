import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageLayout = ({ title, children }) => (
    <div className="min-h-screen bg-white font-nunito">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Store
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 uppercase tracking-tight">{title}</h1>
            <div className="prose prose-lg prose-gray max-w-none">
                {children}
            </div>
        </div>
    </div>
);

export const About = () => (
    <PageLayout title="About Us">
        <p>
            Welcome to <strong>Epic Threadz</strong>, where street culture meets premium craftsmanship.
            born in the streets of Mumbai, we set out with a simple mission: to create streetwear that speaks volumes
            without saying a word.
        </p>
        <p>
            Our designs are inspired by the chaotic symphony of urban life—the lights, the noise, the hustle.
            We believe that clothing shouldn't just be something you wear; it should be an extension of your personality.
            Bold, unapologetic, and authentic.
        </p>
        <div className="my-8">
            <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000"
                alt="Our Workshop"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
        </div>
        <h3>Our Promise</h3>
        <p>
            Quality is not just a buzzword for us. Every stitch, every print, and every fabric is rigorously tested
            to ensure it survives the grind. We use 100% premium cotton and sustainable practices because looking good
            shouldn't cost the earth.
        </p>
        <h3>Join the Tribe</h3>
        <p>
            We are more than a brand; we are a community of creators, dreamers, and rebels. When you wear Epic Threadz,
            you're part of a movement that celebrates individuality.
        </p>
    </PageLayout>
);

export const Terms = () => (
    <PageLayout title="Terms & Conditions">
        <p>Last Updated: December 2025</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and placing an order with Epic Threadz, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Epic Threadz.</p>

        <h3>2. Products</h3>
        <p>All products and services are subject to availability and may be withdrawn at any time. If your order cannot be fulfilled, you will be offered an alternative or given a full refund.</p>

        <h3>3. Pricing</h3>
        <p>Prices are as set out on the website and include GST for orders within India. We reserve the right to alter prices at any time.</p>

        <h3>4. Returns</h3>
        <p>Please review our Return Policy for detailed information about returns and exchanges.</p>
    </PageLayout>
);

export const Privacy = () => (
    <PageLayout title="Privacy Policy">
        <p>Your privacy is important to us. It is Epic Threadz's policy to respect your privacy regarding any information we may collect from you across our website.</p>

        <h3>Information We Collect</h3>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>

        <h3>How We Use It</h3>
        <ul>
            <li>To process and deliver your orders.</li>
            <li>To send you updates about your order.</li>
            <li>To verify your identity (OTP verification).</li>
            <li>To improve our store offerings.</li>
        </ul>

        <h3>Security</h3>
        <p>We don't share any personally identifying information publicly or with third-parties, except when required to by law.</p>
    </PageLayout>
);

export const ReturnPolicy = () => (
    <PageLayout title="Return Policy">
        <p>We want you to love what you ordered! But if something isn't right, let us know.</p>

        <h3>7-Day Easy Returns</h3>
        <p>You can return any unworn, unwashed item with tags intact within 7 days of delivery.</p>

        <h3>How to Return</h3>
        <ol>
            <li>Go to "Track Order" or "My Orders".</li>
            <li>Select the item you wish to return.</li>
            <li>Choose a reason and schedule a pickup.</li>
        </ol>

        <h3>Refunds</h3>
        <p>Refunds are processed within 48 hours of us receiving the returned item. The amount will be credited back to your original payment method.</p>
    </PageLayout>
);

export const Blog = () => (
    <PageLayout title="The Epic Blog">
        <div className="grid gap-8">
            <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <span className="text-primary-600 font-bold text-sm tracking-wider">STYLE GUIDE</span>
                <h2 className="text-2xl font-bold mt-2 mb-3">Streetwear Trends 2025</h2>
                <p className="text-gray-600 mb-4">Discover the oversized fits and bold graphic tees taking over the streets this year...</p>
                <Link to="#" className="text-black font-bold hover:underline">Read More →</Link>
            </div>

            <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <span className="text-primary-600 font-bold text-sm tracking-wider">BEHIND THE SCENES</span>
                <h2 className="text-2xl font-bold mt-2 mb-3">Making of the 'Neon Nights' Collection</h2>
                <p className="text-gray-600 mb-4">From sketchpad to the streets, see how we designed our most popular drop yet...</p>
                <Link to="#" className="text-black font-bold hover:underline">Read More →</Link>
            </div>
        </div>
    </PageLayout>
);

