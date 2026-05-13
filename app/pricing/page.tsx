// app/b2b/pricing/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import api from "@/lib/api";
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
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

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

export default function B2BPricingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingSubscription, setExistingSubscription] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  const particles = useMemo(() => generateParticles(20), []);

  useEffect(() => {
    setIsVisible(true);

    // Check subscription only if authenticated
    if (isAuthenticated) {
      checkExistingSubscription();
    }
  }, [isAuthenticated]);

  const checkExistingSubscription = async () => {
    if (!isAuthenticated) return;

    setCheckingSubscription(true);
    try {
      const response = await api.get("/b2b/my-subscription");
      if (response.data.success && response.data.data.hasSubscription) {
        setExistingSubscription(response.data.data);
      }
    } catch (error) {
      console.error("Failed to check subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const plans: Plan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 50,
      priceBDT: 5000,
      maxCategories: 4,
      features: [
        "Basic analytics",
        "Email support",
        "Monthly reports",
        "API access (1,000/day)",
        "CSV data export",
        "Standard security",
        "Basic dashboard",
      ],
      icon: DocumentTextIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "standard",
      name: "Standard",
      price: 100,
      priceBDT: 10000,
      maxCategories: 8,
      features: [
        "Advanced analytics",
        "Priority support (24/7)",
        "Weekly reports",
        "API access (5,000/day)",
        "JSON & CSV export",
        "Advanced security",
        "Custom dashboards",
        "Team access (3 users)",
        "Data visualization",
      ],
      icon: ChartBarIcon,
      color: "from-green-500 to-green-600",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: 299,
      priceBDT: 29900,
      maxCategories: "Unlimited",
      features: [
        "Full access to all data",
        "24/7 dedicated support",
        "Real-time data streaming",
        "API access (50,000/day)",
        "Multiple export formats",
        "Enterprise-grade security",
        "Custom reports & analytics",
        "White-label solution",
        "SLA agreement (99.9%)",
        "Dedicated account manager",
      ],
      icon: RocketLaunchIcon,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const yearlyDiscount = 0.2;
  const getYearlyPrice = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * (1 - yearlyDiscount)).toFixed(0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatBDT = (price: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectPlan = (plan: Plan) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setPendingPlan(plan);
      setShowLoginPrompt(true);
      return;
    }

    // Check if user already has an active subscription
    if (
      existingSubscription?.hasSubscription &&
      existingSubscription.isActive
    ) {
      toast.error(
        `You already have an active ${existingSubscription.tier} subscription. Please cancel it first.`,
      );
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleLoginRedirect = () => {
    // Store the plan in session storage to restore after login
    if (pendingPlan) {
      sessionStorage.setItem("pendingPlan", JSON.stringify(pendingPlan));
    }
    router.push(`/login?redirect=/b2b/pricing`);
  };

  // Check for pending plan after login
  useEffect(() => {
    if (isAuthenticated && !selectedPlan && !showPaymentModal) {
      const storedPlan = sessionStorage.getItem("pendingPlan");
      if (storedPlan) {
        const plan = JSON.parse(storedPlan);
        setSelectedPlan(plan);
        setShowPaymentModal(true);
        sessionStorage.removeItem("pendingPlan");
      }
      checkExistingSubscription();
    }
  }, [isAuthenticated]);

  const applyCoupon = () => {
    if (couponCode === "WELCOME20") {
      setCouponDiscount(20);
      setCouponApplied(true);
      toast.success("Coupon applied! 20% discount");
    } else if (couponCode === "EARLYBIRD") {
      setCouponDiscount(15);
      setCouponApplied(true);
      toast.success("Coupon applied! 15% discount");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      // Validate card details
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        toast.error("Please enter valid card details");
        setIsLoading(false);
        return;
      }

      // Extract card last 4 digits and brand
      const cardNumberClean = cardDetails.number.replace(/\s/g, "");
      const cardLast4 = cardNumberClean.slice(-4);
      const cardBrand = cardNumberClean.startsWith("4")
        ? "Visa"
        : cardNumberClean.startsWith("5")
          ? "Mastercard"
          : cardNumberClean.startsWith("3")
            ? "Amex"
            : "Card";

      // Create subscription
      const subscriptionResponse = await api.post("/b2b/subscribe", {
        tier: selectedPlan.id,
        paymentMethod: "credit_card",
        autoRenew: true,
        cardDetails: {
          last4: cardLast4,
          brand: cardBrand,
          expiry: cardDetails.expiry,
        },
        billingAddress: {
          name: cardDetails.name || user?.name,
          email: user?.email,
        },
        couponCode: couponApplied ? couponCode : undefined,
      });

      if (subscriptionResponse.data.success) {
        const { subscription } = subscriptionResponse.data.data;

        // Confirm payment
        const confirmResponse = await api.post("/b2b/confirm-payment", {
          subscriptionId: subscription.id,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });

        if (confirmResponse.data.success) {
          toast.success(
            `Successfully subscribed to ${selectedPlan.name} plan!`,
          );
          setShowPaymentModal(false);
          router.push("/b2b/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, "").replace(/\D/g, "").substring(0, 16);
    const parts = v.match(/.{1,4}/g);
    return parts ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2)}`;
    }
    return v;
  };

  return (
    <div className="min-h-screen mt-8 bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-black to-black">
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

        <div className="relative px-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div
              className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            >
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
                Access comprehensive voting data, analytics, and insights with
                our flexible subscription plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Existing Subscription Warning (only shown when authenticated and has subscription) */}
      {isAuthenticated &&
        existingSubscription?.hasSubscription &&
        existingSubscription.isActive && (
          <div className="py-8 border-b bg-yellow-500/10 border-yellow-500/30">
            <div className="container px-4 mx-auto text-center">
              <p className="text-yellow-500">
                You already have an active {existingSubscription.tier}{" "}
                subscription expiring in {existingSubscription.remainingDays}{" "}
                days. Please cancel it before purchasing a new plan.
              </p>
              <button
                onClick={() => router.push("/b2b/dashboard")}
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
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                billingCycle === "monthly"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                billingCycle === "yearly"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "text-gray-400 hover:text-white"
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
              const currentPrice =
                billingCycle === "monthly" ? monthlyPrice : yearlyPrice;
              const pricePeriod =
                billingCycle === "monthly" ? "/month" : "/year";

              return (
                <div
                  key={plan.name}
                  className={`relative transform transition-all duration-700 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-12 opacity-0"
                  } ${plan.popular ? "lg:scale-105" : ""}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute z-10 transform -translate-x-1/2 -top-3 left-1/2">
                      <span className="px-4 py-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/25">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div
                    className={`h-full p-8 border rounded-2xl bg-gradient-to-br from-gray-900 to-black ${
                      plan.popular
                        ? "border-red-500/50 shadow-2xl shadow-red-500/10"
                        : "border-gray-800 hover:border-red-500/30"
                    } transition-all duration-300 hover:scale-105`}
                  >
                    <div
                      className={`inline-flex p-3 mb-4 rounded-xl bg-gradient-to-r ${plan.color}`}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        {formatPrice(currentPrice)}
                      </span>
                      <span className="text-gray-400">{pricePeriod}</span>
                      {billingCycle === "yearly" && (
                        <p className="mt-1 text-sm text-green-500">
                          Save {formatPrice(monthlyPrice * 12 - yearlyPrice)}{" "}
                          yearly
                        </p>
                      )}
                    </div>
                    <div className="p-3 mb-6 rounded-lg bg-white/5">
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-white">
                          {plan.maxCategories}
                        </span>{" "}
                        data categories
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        ~
                        {formatBDT(
                          billingCycle === "monthly"
                            ? plan.priceBDT
                            : plan.priceBDT * 12 * 0.8,
                        )}{" "}
                        BDT
                      </p>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <CheckCircleIcon className="flex-shrink-0 w-5 h-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={
                        isAuthenticated &&
                        existingSubscription?.hasSubscription &&
                        existingSubscription.isActive
                      }
                      className={`w-full py-3 font-semibold rounded-lg transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isAuthenticated &&
                      existingSubscription?.hasSubscription &&
                      existingSubscription.isActive
                        ? "Already Subscribed"
                        : "Get Started"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl">
            <div className="p-6 text-center">
              <div className="mb-4 text-5xl">🔒</div>
              <h2 className="mb-2 text-xl font-bold text-white">
                Login Required
              </h2>
              <p className="mb-6 text-gray-400">
                Please login or create an account to purchase a subscription.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 text-gray-300 transition-all bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="flex-1 px-4 py-2 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (only shown when authenticated) */}
      {showPaymentModal && selectedPlan && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-bold text-white">
                    Complete Purchase
                  </h2>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Plan Summary */}
              <div className="p-4 mb-6 rounded-lg bg-gray-800/50">
                <p className="text-sm text-gray-400">Selected Plan</p>
                <p className="text-xl font-bold text-white">
                  {selectedPlan.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-red-500">
                    {formatPrice(
                      billingCycle === "monthly"
                        ? selectedPlan.price
                        : parseInt(getYearlyPrice(selectedPlan.price)),
                    )}
                    <span className="text-sm text-base text-gray-400">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </p>
                  {couponApplied && (
                    <span className="text-sm text-green-500">
                      -{couponDiscount}%
                    </span>
                  )}
                </div>
                {billingCycle === "yearly" && (
                  <p className="mt-1 text-xs text-green-500">
                    🎉 You're saving 20% with yearly billing
                  </p>
                )}
              </div>

              {/* Card Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                    className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        number: formatCardNumber(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: formatExpiry(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      CVC
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cvc: e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 3),
                        })
                      }
                      className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
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

              {/* Total */}
              <div className="pt-4 mt-6 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">
                    {formatPrice(
                      billingCycle === "monthly"
                        ? selectedPlan.price
                        : parseInt(getYearlyPrice(selectedPlan.price)),
                    )}
                  </span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-400">
                      Discount ({couponDiscount}%)
                    </span>
                    <span className="text-green-500">
                      -
                      {formatPrice(
                        (billingCycle === "monthly"
                          ? selectedPlan.price
                          : parseInt(getYearlyPrice(selectedPlan.price))) *
                          (couponDiscount / 100),
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 mt-3 text-lg font-bold border-t border-gray-800">
                  <span className="text-white">Total</span>
                  <span className="text-red-500">
                    {formatPrice(
                      (billingCycle === "monthly"
                        ? selectedPlan.price
                        : parseInt(getYearlyPrice(selectedPlan.price))) *
                        (1 - (couponApplied ? couponDiscount / 100 : 0)),
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full py-3 mt-6 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Pay ${formatPrice((billingCycle === "monthly" ? selectedPlan.price : parseInt(getYearlyPrice(selectedPlan.price))) * (1 - (couponApplied ? couponDiscount / 100 : 0)))}`
                )}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                <ShieldCheckIcon className="inline-block w-3 h-3 mr-1" />
                Secure payment encrypted. Your subscription will automatically
                renew unless cancelled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Compare Plans
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400">
              Choose the plan that best fits your organization's needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-left text-white">Feature</th>
                  <th className="p-4 text-center text-white">Basic</th>
                  <th className="p-4 text-center text-white">Standard</th>
                  <th className="p-4 text-center text-white">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Data Categories</td>
                  <td className="p-4 text-center text-gray-400">Up to 4</td>
                  <td className="p-4 text-center text-gray-400">Up to 8</td>
                  <td className="p-4 text-center text-gray-400">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">API Rate Limit</td>
                  <td className="p-4 text-center text-gray-400">1,000/day</td>
                  <td className="p-4 text-center text-gray-400">5,000/day</td>
                  <td className="p-4 text-center text-gray-400">50,000/day</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Data Export Formats</td>
                  <td className="p-4 text-center text-gray-400">CSV</td>
                  <td className="p-4 text-center text-gray-400">CSV, JSON</td>
                  <td className="p-4 text-center text-gray-400">
                    CSV, JSON, XML
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Support Level</td>
                  <td className="p-4 text-center text-gray-400">Email</td>
                  <td className="p-4 text-center text-gray-400">
                    Priority 24/7
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    Dedicated 24/7
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Real-time Data</td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">Custom Reports</td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">✅</td>
                  <td className="p-4 text-center text-gray-400">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">White-label Solution</td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">✅</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="p-4 text-gray-300">
                    Dedicated Account Manager
                  </td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">❌</td>
                  <td className="p-4 text-center text-gray-400">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 bg-black">
        <div className="container px-4 mx-auto">
          <div className="p-8 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Need a Custom Enterprise Plan?
            </h2>
            <p className="max-w-2xl mx-auto mb-6 text-gray-400">
              Contact our sales team for custom pricing, SLA guarantees, and
              dedicated infrastructure tailored to your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push("/contact")}
                className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
              >
                Contact Sales
              </button>
              <button
                onClick={() => router.push("/b2b/request-data")}
                className="px-6 py-3 font-semibold text-gray-300 transition-all border border-gray-700 rounded-lg hover:bg-white/5"
              >
                Request Data Access
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-60px) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
