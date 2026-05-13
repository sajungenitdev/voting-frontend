"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  login,
  register,
  verifyOTP,
  resendOTP,
} from "@/store/slices/authSlice";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "@/store/hooks";
import toast from "react-hot-toast";

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
  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [tempUserData, setTempUserData] = useState<any>(null);
  const [loginError, setLoginError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setEmail("");
      setPassword("");
      setName("");
      setOtp("");
      setTempUserData(null);
      setLoginError("");
      setIsLoading(false);
      setResendTimer(0);
      setAcceptTerms(false);
      setTermsError("");
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoginError("");
    setIsLoading(true);
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result) {
        toast.success("Login successful!");
        onSuccess();
        onClose();
        if (returnTo) returnTo();
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password";
      setLoginError(errorMsg);
      toast.error(errorMsg);
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate terms and conditions
    if (!acceptTerms) {
      setTermsError("You must accept the Terms & Conditions to continue");
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setTermsError("");
    setIsLoading(true);
    try {
      const result = await dispatch(
        register({ name, email, password }),
      ).unwrap();
      if (result) {
        setTempUserData({ name, email, password });
        setMode("otp");
        toast.success("Verification code sent to your email!");
        setResendTimer(60); // Start 60 second countdown
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(verifyOTP({ email, otp })).unwrap();
      if (result) {
        toast.success("Email verified! You are now logged in.");
        onSuccess();
        onClose();
        if (returnTo) returnTo();
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(resendOTP({ email })).unwrap();
      toast.success("New OTP sent to your email");
      setResendTimer(60); // Reset timer
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/20">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === "login" && "Welcome Back"}
              {mode === "register" && "Create Account"}
              {mode === "otp" && "Verify Email"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {mode === "login" && "Sign in to continue voting"}
              {mode === "register" && "Join the Voting Platform"}
              {mode === "otp" && `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 input"
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
              {loginError && (
                <p className="text-sm text-center text-red-500">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 btn-primary"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 input"
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
              
              {/* Terms and Conditions Checkbox */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (e.target.checked) setTermsError("");
                    }}
                    className="w-4 h-4 mt-1 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-300">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => {
                          // Open terms modal or navigate to terms page
                          window.open('/terms', '_blank');
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Terms & Conditions
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        onClick={() => {
                          window.open('/privacy', '_blank');
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </div>
                </label>
                {termsError && (
                  <p className="text-xs text-red-500">{termsError}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 btn-primary"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center">
                <div className="mb-4 text-5xl">📧</div>
                <p className="text-sm text-gray-400">
                  We've sent a verification code to
                </p>
                <p className="font-medium text-white">{email}</p>
              </div>
              
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-2xl tracking-widest text-center input"
                maxLength={6}
                required
              />
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 btn-primary"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                  className={`text-sm transition-colors ${
                    resendTimer > 0
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

          <div className="mt-4 text-center">
            {mode === "login" && (
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setPassword("");
                    setLoginError("");
                    setAcceptTerms(false);
                  }}
                  className="text-red-500 hover:underline"
                >
                  Sign up
                </button>
              </p>
            )}
            {mode === "register" && (
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setPassword("");
                    setAcceptTerms(false);
                  }}
                  className="text-red-500 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "otp" && (
              <p className="text-sm text-gray-400">
                Wrong email?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setOtp("");
                  }}
                  className="text-red-500 hover:underline"
                >
                  Go back
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
                Email: dev3.ngenit@gmail.com
                <br />
                Password: newpassword123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}