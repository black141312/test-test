import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';

import { store } from '../App';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // Send email to support
            // Send email to support
            await store.sendNotification({
                to: 'admin@epicthreadz.in', // Send to merchant/support
                subject: `New Contact Message from ${formData.name}`,
                message: `From: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`,
                type: 'email'
            });

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            console.error('Contact form error:', err);
            // Even if it fails (e.g. SMTP not configured), show success to user so they don't retry endlessly, 
            // unless it's a network error. But for demo/UX, maybe just toggle success or show error.
            // For now, let's assume if it fails, we show error.
            alert('Failed to send message. Please try again later.');
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-white font-nunito">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Store
                </Link>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 uppercase tracking-tight">Contact Us</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Have a question about your order, sizing, or just want to say hi?
                            We'd love to hear from you. Drop us a message or reach out through our socials.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary-600 shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Email Us</h3>
                                    <p className="text-gray-500">admin@epicthreadz.in</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary-600 shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Call Us</h3>
                                    <p className="text-gray-500">+91 98765 43210</p>
                                    <p className="text-xs text-gray-400">Mon-Sat, 10am - 7pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary-600 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Studio</h3>
                                    <p className="text-gray-500">
                                        123 Creative Hub, Andheri West<br />
                                        Mumbai, Maharashtra 400053
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                <p className="text-gray-500 mb-6">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="text-primary-600 font-bold hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border  border-gray-200 focus:outline-none focus:border-primary-500"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 resize-none"
                                        placeholder="How can we help?"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                                    <Send size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

