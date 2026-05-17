"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  login,
  register,
  verifyOTP,
  resendOTP,
  clearError,
} from "@/store/slices/authSlice";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import GoogleOneTapLogin from "./GoogleOneTapLogin";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  returnTo?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  returnTo,
}: LoginModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // UI State
  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Error States
  const [loginError, setLoginError] = useState("");
  const [termsError, setTermsError] = useState("");

  // OTP Timer
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        resetForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const resetForm = () => {
    setMode("login");
    setEmail("");
    setPassword("");
    setName("");
    setOtp("");
    setLoginError("");
    setTermsError("");
    setIsLoading(false);
    setIsGoogleLoading(false);
    setResendTimer(0);
    setAcceptTerms(false);
    setShowPassword(false);
    setVerificationEmail("");
    dispatch(clearError());
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (isLoading) return;

    setLoginError("");
    setIsLoading(true);

    try {
      const result = await dispatch(login({ email, password })).unwrap();

      if (result?.user) {
        toast.success("Login successful! Welcome back.");
        onClose();
        onSuccess();
        if (returnTo) returnTo();
        resetForm();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error?.message || "Invalid email or password";
      setLoginError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!acceptTerms) {
      setTermsError("You must accept the Terms & Conditions");
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    if (isLoading) return;

    setTermsError("");
    setIsLoading(true);

    try {
      const result = await dispatch(
        register({ name: name.trim(), email, password }),
      ).unwrap();

      if (result && (result.success || result.message)) {
        setVerificationEmail(email);
        setMode("otp");
        setResendTimer(60);
        toast.success("Verification code sent to your email!");
        setPassword("");
      } else {
        throw new Error("Registration failed - no response");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMsg =
        error?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await dispatch(
        verifyOTP({ email: verificationEmail, otp }),
      ).unwrap();

      if (result?.user) {
        toast.success("Email verified successfully!");
        onClose();
        onSuccess();
        if (returnTo) returnTo();
        resetForm();
      } else {
        throw new Error("Verification failed");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const errorMsg =
        error?.message || "Invalid verification code. Please try again.";
      toast.error(errorMsg);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds`);
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      await dispatch(resendOTP({ email: verificationEmail })).unwrap();
      toast.success("New verification code sent!");
      setResendTimer(60);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMsg =
        error?.message || "Failed to resend code. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    onClose();
    onSuccess();
    if (returnTo) returnTo();
    resetForm();
  };

  const handleGoogleError = (error: string) => {
    console.error("Google login error:", error);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-500/20">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === "login" && "Welcome Back"}
                  {mode === "register" && "Create Account"}
                  {mode === "otp" && "Verify Your Email"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {mode === "login" && "Sign in to continue voting"}
                  {mode === "register" && "Join the Voting Platform"}
                  {mode === "otp" && `Code sent to ${verificationEmail}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-white disabled:opacity-50"
                disabled={isLoading || isGoogleLoading}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Google Login Button - Only show on login and register modes */}
              {(mode === "login" || mode === "register") && (
                <div className="mb-6">
                  <GoogleOneTapLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    buttonText="Sign in with Google"
                    className="w-full"
                  />

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 text-gray-500 bg-gradient-to-b from-gray-900 to-black">
                        OR
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError("");
                      }}
                      className="w-full px-4 py-2 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError("");
                      }}
                      className="w-full px-4 py-2 pr-10 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {loginError && (
                    <p className="text-sm text-center text-red-500 animate-shake">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full py-3 font-semibold text-white transition-all duration-200 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              )}

              {/* Registration Form */}
              {mode === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (minimum 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => {
                          setAcceptTerms(e.target.checked);
                          if (e.target.checked) setTermsError("");
                        }}
                        className="w-4 h-4 mt-1 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-offset-0"
                        disabled={isLoading || isGoogleLoading}
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-300">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => window.open("/terms", "_blank")}
                            className="text-red-500 transition-colors hover:text-red-400 hover:underline"
                          >
                            Terms & Conditions
                          </button>{" "}
                          and{" "}
                          <button
                            type="button"
                            onClick={() => window.open("/privacy", "_blank")}
                            className="text-red-500 transition-colors hover:text-red-400 hover:underline"
                          >
                            Privacy Policy
                          </button>
                        </span>
                      </div>
                    </label>
                    {termsError && (
                      <p className="text-xs text-red-500 animate-shake">
                        {termsError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full py-3 font-semibold text-white transition-all duration-200 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
              )}

              {/* OTP Verification Form */}
              {mode === "otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="text-center">
                    <div className="mb-4 text-5xl animate-bounce">📧</div>
                    <p className="text-sm text-gray-400">
                      We've sent a verification code to
                    </p>
                    <p className="font-medium text-white break-all">
                      {verificationEmail}
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                        )
                      }
                      className="w-full px-4 py-3 text-2xl tracking-widest text-center text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      maxLength={6}
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading || otp.length !== 6}
                    className="w-full py-3 font-semibold text-white transition-all duration-200 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isLoading || isGoogleLoading}
                      className={`text-sm transition-colors ${
                        resendTimer > 0 || isLoading || isGoogleLoading
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      {resendTimer > 0
                        ? `Resend code in ${resendTimer}s`
                        : "Didn't receive code? Resend"}
                    </button>
                  </div>
                </form>
              )}

              {/* Mode Switcher */}
              <div className="mt-4 text-center">
                {mode === "login" && (
                  <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setPassword("");
                        setLoginError("");
                        setAcceptTerms(false);
                      }}
                      className="text-red-500 transition-colors hover:text-red-400 hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                )}
                {mode === "register" && (
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setPassword("");
                        setAcceptTerms(false);
                      }}
                      className="text-red-500 transition-colors hover:text-red-400 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === "otp" && (
                  <p className="text-sm text-gray-400">
                    Wrong email?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setOtp("");
                        setVerificationEmail("");
                      }}
                      className="text-red-500 transition-colors hover:text-red-400 hover:underline"
                    >
                      Go back to registration
                    </button>
                  </p>
                )}
              </div>

              {/* Demo Credentials */}
              {mode === "login" && (
                <div className="p-3 mt-4 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-center text-gray-500">
                    Demo Credentials
                  </p>
                  <p className="mt-1 text-xs text-center text-gray-400">
                    Email: demo@example.com
                    <br />
                    Password: demo123
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
