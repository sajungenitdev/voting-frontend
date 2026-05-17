"use client";

import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleOneTapLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

export default function GoogleOneTapLogin({
  onSuccess,
  onError,
  buttonText = "Sign in with Google",
  className = "",
}: GoogleOneTapLoginProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {
      const scriptEl = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (scriptEl) scriptEl.remove();
    };
  }, []);

  const initGoogle = () => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "rectangular",
    });
  };

  const handleCredential = async (response: any) => {
    setIsLoading(true);

    try {
      console.log("Sending credential to backend...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        },
      );

      const data = await res.json();
      console.log("Backend response:", data);

      if (data.success) {
        // Store auth data
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Dispatch events
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("auth-storage-updated"));

        toast.success(
          `Welcome ${data.data.user.name || data.data.user.email}!`,
        );
        onSuccess?.();

        // Reload to update UI
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="w-5 h-5 border-2 border-gray-400 rounded-full border-t-transparent animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div ref={buttonRef} className="w-full" />
      )}
    </div>
  );
}
