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
import toast from "react-hot-toast";

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
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-400">
            Sign in to access your voting dashboard
          </p>
        </div>

        <div className="p-8 border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-gray-500"
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
              <p className="text-sm text-center text-red-500">{loginError}</p>
            )}

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-red-500 transition-colors hover:text-red-400"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
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
          <div className="p-3 mt-6 rounded-lg bg-white/5">
            <p className="text-xs text-center text-gray-500">
              Testing Credentials
            </p>
            <p className="mt-1 text-xs text-center text-gray-400">
              Email: dev3.ngenit@gmail.com
              <br />
              Password: newpassword123
            </p>
          </div>
        </div>
      </div>

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
