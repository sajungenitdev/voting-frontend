"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { register, verifyOTP, resendOTP } from "@/store/slices/authSlice";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import GoogleOneTapLogin from "@/components/ui/GoogleOneTapLogin";

// Particle logic
function generateParticles(count = 20) {
  return Array.from({ length: count }).map(() => ({
    id: crypto.randomUUID(),
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 6,
    delay: Math.random() * 5,
  }));
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const particles = useMemo(() => generateParticles(15), []);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setTermsError("You must accept the Terms & Conditions");
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    setIsLoading(true);
    try {
      const result = await dispatch(
        register({ name, email, password }),
      ).unwrap();
      if (result) {
        setStep("otp");
        toast.success("Verification code sent!");
        setResendTimer(60);
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await dispatch(verifyOTP({ email, otp })).unwrap();
      if (result) {
        toast.success("Verified successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await dispatch(resendOTP({ email })).unwrap();
      toast.success("New OTP sent");
      setResendTimer(60);
    } catch (error: any) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    toast.success("Google login successful! Redirecting...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handleGoogleError = (error: string) => {
    console.error("Google login error:", error);
    toast.error(error || "Google login failed");
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] animate-pulse" />
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

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20"
          >
            {step === "form" ? (
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            ) : (
              <EnvelopeIcon className="w-8 h-8 text-white" />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold tracking-tight text-white"
          >
            {step === "form" ? "Create Account" : "Verify Email"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-gray-400"
          >
            {step === "form"
              ? "Join the future of secure voting"
              : `Enter code sent to ${email}`}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl"
        >
          {step === "form" ? (
            <>
              {/* Google Login Button */}
              <div className="mb-6">
                <GoogleOneTapLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  buttonText="Sign up with Google"
                  className="w-full"
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 text-gray-500 bg-transparent backdrop-blur-sm">
                      OR
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        if (e.target.checked) setTermsError("");
                      }}
                      className="w-5 h-5 mt-0.5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-400 transition-colors group-hover:text-gray-300">
                      I agree to the <span className="text-red-500">Terms</span>{" "}
                      & <span className="text-red-500">Privacy Policy</span>
                    </span>
                  </label>
                  {termsError && (
                    <p className="text-xs text-red-500 animate-pulse">
                      {termsError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading
                    ? "Generating Secure Account..."
                    : "Create Free Account"}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <input
                type="text"
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 text-3xl tracking-[1rem] text-center text-white bg-white/5 border border-white/10 rounded-xl focus:border-red-500 outline-none"
                maxLength={6}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 font-bold text-white transition-all bg-red-600 shadow-lg rounded-xl hover:bg-red-500 shadow-red-600/20 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Confirm Verification"}
              </button>

              <div className="space-y-4 text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                  className={`text-sm font-medium transition-colors ${
                    resendTimer > 0
                      ? "text-gray-600"
                      : "text-red-500 hover:text-red-400"
                  }`}
                >
                  {resendTimer > 0
                    ? `Resend available in ${resendTimer}s`
                    : "Resend code"}
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-sm text-gray-500 transition-colors hover:text-white"
                >
                  ← Use a different email
                </button>
              </div>
            </form>
          )}

          {step === "form" && (
            <p className="mt-8 text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-red-500 hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </motion.div>

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
            transform: translateY(-40px) translateX(10px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
