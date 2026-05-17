"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import GoogleOneTapLogin from "@/components/ui/GoogleOneTapLogin";

// Particle logic consistent with Hero/Register
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

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // UI State
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const particles = useMemo(() => generateParticles(15), []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMsg = error.message || "Invalid email or password";
      setLoginError(errorMsg);
      toast.error(errorMsg);
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
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Animated Glows */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] animate-pulse" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Particles */}
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

      {/* LOGIN CARD */}
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
            <LockClosedIcon className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold tracking-tight text-white"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-gray-400"
          >
            Sign in to access your voting dashboard
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl"
        >
          {/* Google Login Button */}
          <div className="mb-6">
            <GoogleOneTapLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              onLoadingChange={setIsGoogleLoading}
              buttonText="Continue with Google"
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

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-gray-500"
                disabled={isLoading || isGoogleLoading}
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-gray-500"
                disabled={isLoading || isGoogleLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-white"
                disabled={isLoading || isGoogleLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {loginError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center text-red-500"
              >
                {loginError}
              </motion.p>
            )}

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-red-500 transition-colors hover:text-red-400"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-4 font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <div className="pt-6 mt-8 border-t border-white/5">
            <p className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-red-500 transition-colors hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-3 mt-6 rounded-lg bg-white/5"
          >
            <p className="text-xs text-center text-gray-500">
              Testing Credentials
            </p>
            <p className="mt-1 text-xs text-center text-gray-400">
              Email: dev3.ngenit@gmail.com
              <br />
              Password: newpassword123
            </p>
          </motion.div> */}
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
