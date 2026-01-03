import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../App';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Input, 2: OTP & Details
    const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [name, setName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [gender, setGender] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [isNewUser, setIsNewUser] = useState(false);
    const [otpInfo, setOtpInfo] = useState(null);
    const [tempUser, setTempUser] = useState(null); // Used for Google post-login completion
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];
    const navigate = useNavigate();

    // Handle OAuth callback
    useEffect(() => {
        const handleCallback = async () => {
            try {
                const result = await store.handleOAuthCallback();
                if (result) {
                    // If Google login but no phone number, ask for it
                    const userInfo = { ...result.user, token: result.token };
                    localStorage.setItem('customerInfo', JSON.stringify(userInfo));
                    window.location.href = '/';
                }
            } catch (err) {
                setError('Failed to process login. Please try again.');
            }
        };
        handleCallback();
    }, []);

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loginMethod === 'phone' && phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        if (loginMethod === 'email' && !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const identifier = loginMethod === 'phone' ? '+91' + phone : email;
            const response = await store.sendOtp(identifier, loginMethod);

            setStep(2);
            setResendTimer(30);
            setIsNewUser(response.isNewUser);
            setOtpInfo({
                channel: response.channel,
                otp: response.otp
            });
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) otpRefs[index + 1].current?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length !== 4) {
            setError('Please enter complete 4-digit OTP');
            return;
        }

        if (isNewUser && !name.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const identifier = loginMethod === 'phone' ? '+91' + phone : email;
            const result = await store.verifyOtp(identifier, otpValue, {
                name: name.trim(),
                email: loginMethod === 'email' ? email : profileEmail.trim(),
                phone: loginMethod === 'phone' ? '+91' + phone : (phone ? '+91' + phone : ''),
                gender
            });

            const userInfo = { ...result.user, token: result.token };
            localStorage.setItem('customerInfo', JSON.stringify(userInfo));
            window.location.href = '/';
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError('');

        try {
            const identifier = loginMethod === 'phone' ? '+91' + phone : email;
            const response = await store.sendOtp(identifier, loginMethod);
            setResendTimer(30);
            setOtpInfo({ channel: response.channel, otp: response.otp });
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileCompletion = async (e) => {
        e.preventDefault();

        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Update phone number
            const fullPhone = '+91' + phone;
            await store.updateProfile({ phoneNumber: fullPhone });

            // Update local object
            const userInfo = { ...tempUser.user, phone: fullPhone, token: tempUser.token };
            localStorage.setItem('customerInfo', JSON.stringify(userInfo));
            window.location.href = '/';
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = store.getGoogleAuthUrl(window.location.origin + '/login');
    };

    const getChannelMessage = () => {
        if (!otpInfo) return null;
        const messages = {
            whatsapp: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: '💬', msg: 'OTP sent via WhatsApp' },
            email: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: '📧', msg: 'OTP sent to your email' },
            sms: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', icon: '📱', msg: 'OTP sent via SMS' },
            demo: { bg: 'bg-primary-50', border: 'border-primary-100', text: 'text-primary-600', icon: '🧪', msg: `Demo Mode - OTP: ${otpInfo.otp}` }
        };
        return messages[otpInfo.channel] || messages.demo;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Epic Threadz" className="w-12 h-12 object-contain" />
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">EPIC</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">THREADZ</span>
                        </div>
                    </div>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {step === 3 ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Profile</h1>
                                <p className="text-gray-500">Please provide your mobile number to continue.</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleProfileCompletion}>
                                <div className="mb-6">
                                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-primary-500 transition-colors">
                                        <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                            <span className="text-xl">🇮🇳</span>
                                            <span className="text-gray-700 font-medium">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1 ml-3 outline-none text-gray-800 placeholder-gray-400 text-lg"
                                            placeholder="Enter Mobile Number"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || phone.length !== 10}
                                    className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                            Updating...
                                        </span>
                                    ) : 'Complete Profile'}
                                </button>

                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Skip
                                            const userInfo = { ...tempUser.user, token: tempUser.token };
                                            localStorage.setItem('customerInfo', JSON.stringify(userInfo));
                                            window.location.href = '/';
                                        }}
                                        className="text-gray-400 text-sm hover:text-gray-600"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : step === 1 ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Login / Signup</h1>
                                <p className="text-gray-500">Join us now to be a part of Epic Threadz family.</p>
                            </div>

                            {/* Toggle: Phone / Email */}
                            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                                <button
                                    type="button"
                                    onClick={() => { setLoginMethod('phone'); setError(''); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    📱 Phone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setLoginMethod('email'); setError(''); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    📧 Email
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {loginMethod === 'phone' ? (
                                    <div className="mb-6">
                                        <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-primary-500 transition-colors">
                                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                                <span className="text-xl">🇮🇳</span>
                                                <span className="text-gray-700 font-medium">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                className="flex-1 ml-3 outline-none text-gray-800 placeholder-gray-400 text-lg"
                                                placeholder="Enter Mobile Number"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-primary-500 transition-colors">
                                            <span className="text-xl mr-3">📧</span>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-lg"
                                                placeholder="Enter Email Address"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || (loginMethod === 'phone' ? phone.length !== 10 : !email.includes('@'))}
                                    className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                            Sending OTP...
                                        </span>
                                    ) : 'Continue'}
                                </button>
                            </form>

                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-gray-400 text-sm font-medium">OR</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3.5 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-gray-700 font-medium">Continue with Google</span>
                            </button>

                            <p className="mt-8 text-center text-gray-500 text-sm">
                                By continuing, you agree to our{' '}
                                <a href="#" className="text-blue-600 hover:underline">T&C</a> and{' '}
                                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                            </p>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => { setStep(1); setOtp(['', '', '', '']); setError(''); setOtpInfo(null); }}
                                className="mb-6 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>

                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
                                <p className="text-gray-500">
                                    Enter the OTP sent to {loginMethod === 'phone' ? `+91 ${phone}` : email}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {otpInfo && (() => {
                                const ch = getChannelMessage();
                                return (
                                    <div className={`mb-6 p-3 ${ch.bg} border ${ch.border} rounded-lg ${ch.text} text-sm flex items-center gap-2`}>
                                        <span>{ch.icon}</span>
                                        <span>{ch.msg}</span>
                                    </div>
                                );
                            })()}

                            <form onSubmit={handleVerify} className="space-y-5">
                                {/* OTP Input */}
                                <div>
                                    <div className="flex gap-3 justify-center mb-3">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={otpRefs[index]}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-colors ${digit ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
                                                    } focus:border-primary-500`}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-center">
                                        {resendTimer > 0 ? (
                                            <span className="text-gray-500 text-sm">Resend in {resendTimer}s</span>
                                        ) : (
                                            <button type="button" onClick={handleResendOtp} disabled={loading} className="text-blue-600 text-sm hover:underline">
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Profile Fields (for new users) */}
                                {isNewUser && (
                                    <>
                                        <div>
                                            <label className="block text-gray-600 text-sm mb-1.5">Full Name *</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:outline-none"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        {loginMethod === 'phone' && (
                                            <div>
                                                <label className="block text-gray-600 text-sm mb-1.5">Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={profileEmail}
                                                    onChange={(e) => setProfileEmail(e.target.value)}
                                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:outline-none"
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                        )}
                                        {loginMethod === 'email' && (
                                            <div>
                                                <label className="block text-gray-600 text-sm mb-1.5">Phone (Optional)</label>
                                                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-primary-500 transition-colors">
                                                    <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                                                        <span className="text-gray-700 font-medium">+91</span>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        className="flex-1 ml-3 outline-none text-gray-800 placeholder-gray-400"
                                                        placeholder="9876543210"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-gray-600 text-sm mb-1.5">Gender</label>
                                            <div className="flex gap-2">
                                                {['Male', 'Female', 'Other'].map((g) => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setGender(g)}
                                                        className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${gender === g ? 'bg-primary-100 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-600'
                                                            }`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || otp.join('').length !== 4}
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 uppercase tracking-wide shadow-lg shadow-primary-500/25"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Verifying...
                                        </span>
                                    ) : 'Verify & Continue'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;

