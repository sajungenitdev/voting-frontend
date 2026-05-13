// app/b2b/pricing/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/solid';

// Generate particles for background
function generateParticles(count = 20) {
  return Array.from({ length: count }).map(() => ({
    id: crypto.randomUUID(),
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 12 + 6,
    delay: Math.random() * 5,
  }));
}

interface Plan {
  id: string;
  name: string;
  price: number;
  priceBDT: number;
  maxCategories: number | string;
  features: string[];
  icon: any;
  color: string;
  popular?: boolean;
}

interface Category {
  _id: string;
  name: string;
  displayName: string;
  icon: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

export default function B2BPricingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [existingSubscription, setExistingSubscription] = useState<any>(null);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Request form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  // Payment state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const particles = useMemo(() => generateParticles(20), []);

  // Fetch dynamic categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get('/categories');
        if (response.data.success) {
          // Filter only active categories and remove duplicates by name
          const activeCategories = response.data.data.categories.filter((c: Category) => c.isActive);
          const uniqueCategories = activeCategories.reduce((acc: Category[], current: Category) => {
            const exists = acc.find(item => item.name === current.name);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);
          setDynamicCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    if (isAuthenticated && user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      checkExistingSubscription();
    }
  }, [isAuthenticated, user]);

  const checkExistingSubscription = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/b2b/my-subscription');
      if (response.data.success && response.data.data.hasSubscription && response.data.data.isActive) {
        setHasActiveSubscription(true);
        setExistingSubscription(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to check subscription:', error);
      }
    }
  };

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 50,
      priceBDT: 5000,
      maxCategories: 4,
      features: [
        'Basic analytics',
        'Email support',
        'Monthly reports',
        'API access (1,000/day)',
        'CSV data export',
        'Standard security',
      ],
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 100,
      priceBDT: 10000,
      maxCategories: 8,
      features: [
        'Advanced analytics',
        'Priority support (24/7)',
        'Weekly reports',
        'API access (5,000/day)',
        'JSON & CSV export',
        'Advanced security',
        'Custom dashboards',
        'Team access (3 users)',
      ],
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-600',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 299,
      priceBDT: 29900,
      maxCategories: 'Unlimited',
      features: [
        'Full access to all data',
        '24/7 dedicated support',
        'Real-time data streaming',
        'API access (50,000/day)',
        'Multiple export formats',
        'Enterprise-grade security',
        'Custom reports & analytics',
        'White-label solution',
        'SLA agreement (99.9%)',
        'Dedicated account manager',
      ],
      icon: RocketLaunchIcon,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const yearlyDiscount = 0.2;
  const getYearlyPrice = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * (1 - yearlyDiscount)).toFixed(0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatBDT = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectPlan = (plan: Plan) => {
    if (hasActiveSubscription) {
      toast.error(`You already have an active subscription. Please cancel it first.`);
      return;
    }
    setSelectedPlan(plan);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !phoneNumber || !purpose) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one data category');
      return;
    }
    
    if (!termsAgreed || !complianceAgreed) {
      toast.error('Please agree to the terms and compliance');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/b2b/request', {
        fullName,
        email,
        phoneNumber,
        purpose,
        selectedCategories,
        termsAgreed,
        complianceAgreed,
      });
      
      if (response.data.success) {
        setRequestId(response.data.data.requestId);
        setRequestEmail(email);
        setShowRequestModal(false);
        setShowOtpModal(true);
        setResendTimer(60);
        toast.success('Request submitted! Please check your email for OTP.');
      }
    } catch (error: any) {
      console.error('Request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/b2b/verify-otp', {
        email: requestEmail,
        otp,
        requestId,
      });
      
      if (response.data.success) {
        toast.success('OTP verified! You can now complete your purchase.');
        setShowOtpModal(false);
        
        if (response.data.data.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
          if (response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
        }
        
        setShowPaymentModal(true);
      }
    } catch (error: any) {
      console.error('OTP error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds`);
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/b2b/resend-otp', { email: requestEmail, requestId });
      toast.success('New OTP sent to your email');
      setResendTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = () => {
    if (couponCode === 'WELCOME20') {
      setCouponDiscount(20);
      setCouponApplied(true);
      toast.success('Coupon applied! 20% discount');
    } else if (couponCode === 'EARLYBIRD') {
      setCouponDiscount(15);
      setCouponApplied(true);
      toast.success('Coupon applied! 15% discount');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    try {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        toast.error('Please enter valid card details');
        setIsLoading(false);
        return;
      }
      
      const cardNumberClean = cardDetails.number.replace(/\s/g, '');
      const cardLast4 = cardNumberClean.slice(-4);
      const cardBrand = cardNumberClean.startsWith('4') ? 'Visa' : 
                        cardNumberClean.startsWith('5') ? 'Mastercard' : 
                        cardNumberClean.startsWith('3') ? 'Amex' : 'Card';
      
      const subscriptionResponse = await api.post('/b2b/subscribe', {
        tier: selectedPlan.id,
        paymentMethod: 'credit_card',
        autoRenew: true,
        cardDetails: {
          last4: cardLast4,
          brand: cardBrand,
          expiry: cardDetails.expiry,
        },
        billingAddress: {
          name: cardDetails.name || fullName,
          email: requestEmail,
        },
        couponCode: couponApplied ? couponCode : undefined,
      });
      
      if (subscriptionResponse.data.success) {
        const { subscription } = subscriptionResponse.data.data;
        
        const confirmResponse = await api.post('/b2b/confirm-payment', {
          subscriptionId: subscription.id,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
        
        if (confirmResponse.data.success) {
          toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
          setShowPaymentModal(false);
          router.push('/b2b/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '').substring(0, 16);
    const parts = v.match(/.{1,4}/g);
    return parts ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2)}`;
    }
    return v;
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative mt-8 overflow-hidden bg-gradient-to-b from-gray-900 via-black to-black">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-red-500/20"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                animation: `float ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative px-4 pt-20 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border rounded-full bg-red-500/10 border-red-500/30">
                <BuildingOfficeIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">B2B Data Access</span>
              </div>
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
                Enterprise Data
                <span className="block text-transparent bg-gradient-to-r from-red-500 to-red-800 bg-clip-text">
                  Subscription Plans
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-400">
                Access comprehensive voting data, analytics, and insights with our flexible subscription plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Subscription Warning */}
      {hasActiveSubscription && (
        <div className="py-4 border-b bg-yellow-500/10 border-yellow-500/30">
          <div className="container px-4 mx-auto text-center">
            <p className="text-yellow-500">
              You already have an active {existingSubscription?.tier} subscription.
              Please manage your subscription from the dashboard.
            </p>
            <button
              onClick={() => router.push('/b2b/dashboard')}
              className="mt-2 text-sm text-yellow-500 underline"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <section className="py-8 bg-black">
        <div className="px-4 mx-auto text-center">
          <div className="inline-flex p-1 bg-gray-900 border border-gray-800 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-400">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 bg-black">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const monthlyPrice = plan.price;
              const yearlyPrice = parseInt(getYearlyPrice(monthlyPrice));
              const currentPrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
              const pricePeriod = billingCycle === 'monthly' ? '/month' : '/year';

              return (
                <div
                  key={plan.name}
                  className={`relative transform transition-all duration-700 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  } ${plan.popular ? 'lg:scale-105' : ''}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute z-10 transform -translate-x-1/2 -top-3 left-1/2">
                      <span className="px-4 py-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/25">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className={`h-full p-8 border rounded-2xl bg-gradient-to-br from-gray-900 to-black ${
                    plan.popular
                      ? 'border-red-500/50 shadow-2xl shadow-red-500/10'
                      : 'border-gray-800 hover:border-red-500/30'
                  } transition-all duration-300 hover:scale-105`}>
                    <div className={`inline-flex p-3 mb-4 rounded-xl bg-gradient-to-r ${plan.color}`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{formatPrice(currentPrice)}</span>
                      <span className="text-gray-400">{pricePeriod}</span>
                      {billingCycle === 'yearly' && (
                        <p className="mt-1 text-sm text-green-500">
                          Save {formatPrice(monthlyPrice * 12 - yearlyPrice)} yearly
                        </p>
                      )}
                    </div>
                    <div className="p-3 mb-6 rounded-lg bg-white/5">
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-white">{plan.maxCategories}</span> data categories
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        ~{formatBDT(billingCycle === 'monthly' ? plan.priceBDT : plan.priceBDT * 12 * 0.8)} BDT
                      </p>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircleIcon className="flex-shrink-0 w-5 h-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={hasActiveSubscription}
                      className={`w-full py-3 font-semibold rounded-lg transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {hasActiveSubscription ? 'Already Subscribed' : 'Get Started'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Request Access Modal with Dynamic Categories */}
      {showRequestModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-4 bg-gray-900 border-b border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-bold text-white">Request Data Access</h2>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400">Selected Plan: {selectedPlan.name}</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Purpose of Data Access *
                  </label>
                  <div className="relative">
                    <ClipboardDocumentListIcon className="absolute w-5 h-5 text-gray-500 left-3 top-3" />
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={3}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      placeholder="Describe how you plan to use the data..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Select Data Categories *
                  </label>
                  {loadingCategories ? (
                    <div className="py-4 text-center text-gray-400">
                      <ArrowPathIcon className="inline w-5 h-5 mr-2 animate-spin" />
                      Loading categories...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dynamicCategories.map((category) => (
                        <label
                          key={category._id}
                          className="flex items-start gap-3 p-3 transition-all rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => toggleCategory(category.name)}
                            className="w-4 h-4 mt-1 text-red-500 border-gray-600 rounded focus:ring-red-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon || '📊'}</span>
                              <p className="font-medium text-white">{category.displayName}</p>
                              {category.name === 'premium' && (
                                <span className="px-1.5 py-0.5 text-[9px] font-medium text-purple-400 bg-purple-500/20 rounded-full">
                                  Premium
                                </span>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedCategories.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Selected: {selectedCategories.length} category (max: {typeof selectedPlan?.maxCategories === 'number' ? selectedPlan.maxCategories : 'unlimited'})
                    </p>
                  )}
                </div>

                <div className="p-4 space-y-3 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 mt-1 text-red-500 border-gray-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the <span className="text-red-500">Terms & Conditions</span> and 
                      <span className="text-red-500"> Privacy Policy</span>
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceAgreed}
                      onChange={(e) => setComplianceAgreed(e.target.checked)}
                      className="w-4 h-4 mt-1 text-red-500 border-gray-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to comply with all <span className="text-red-500">data usage and compliance regulations</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl">
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="mb-4 text-5xl">📧</div>
                <h2 className="text-xl font-bold text-white">Verify Your Email</h2>
                <p className="mt-2 text-sm text-gray-400">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-sm font-medium text-white">{requestEmail}</p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="w-full px-4 py-3 text-2xl tracking-widest text-center text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                  maxLength={6}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className={`text-sm transition-colors ${
                      resendTimer > 0
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    {resendTimer > 0
                      ? `Resend code in ${resendTimer}s`
                      : "Didn't receive code? Resend"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-bold text-white">Complete Purchase</h2>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 mb-6 rounded-lg bg-gray-800/50">
                <p className="text-sm text-gray-400">Selected Plan</p>
                <p className="text-xl font-bold text-white">{selectedPlan.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-red-500">
                    {formatPrice(billingCycle === 'monthly' ? selectedPlan.price : parseInt(getYearlyPrice(selectedPlan.price)))}
                    <span className="text-sm text-gray-400">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  {couponApplied && <span className="text-sm text-green-500">-{couponDiscount}%</span>}
                </div>
                {billingCycle === 'yearly' && (
                  <p className="mt-1 text-xs text-green-500">🎉 You're saving 20% with yearly billing</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                    className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                      className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">CVC</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').substring(0, 3) })}
                      className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                    className="flex-1 px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">
                    {formatPrice(billingCycle === 'monthly' ? selectedPlan.price : parseInt(getYearlyPrice(selectedPlan.price)))}
                  </span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-400">Discount ({couponDiscount}%)</span>
                    <span className="text-green-500">
                      -{formatPrice((billingCycle === 'monthly' ? selectedPlan.price : parseInt(getYearlyPrice(selectedPlan.price))) * (couponDiscount / 100))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 mt-3 text-lg font-bold border-t border-gray-800">
                  <span className="text-white">Total</span>
                  <span className="text-red-500">
                    {formatPrice((billingCycle === 'monthly' ? selectedPlan.price : parseInt(getYearlyPrice(selectedPlan.price))) * (1 - (couponApplied ? couponDiscount / 100 : 0)))}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full py-3 mt-6 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Pay ${formatPrice((billingCycle === 'monthly' ? selectedPlan.price : parseInt(getYearlyPrice(selectedPlan.price))) * (1 - (couponApplied ? couponDiscount / 100 : 0)))}`
                )}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                <ShieldCheckIcon className="inline-block w-3 h-3 mr-1" />
                Secure payment encrypted. Your subscription will automatically renew unless cancelled.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-60px) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}