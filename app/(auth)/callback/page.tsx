"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Processing...");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    console.log("Callback received:", {
      token: !!token,
      refreshToken: !!refreshToken,
      error,
    });

    let timeoutId: NodeJS.Timeout;

    if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
      timeoutId = setTimeout(() => {
        router.push("/");
      }, 3000);
      return;
    }

    if (token) {
      localStorage.setItem("accessToken", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      setStatus("success");
      setMessage("Login successful! Redirecting...");

      timeoutId = setTimeout(() => {
        router.push("/");
        window.location.reload();
      }, 2000);
    } else {
      setStatus("error");
      setMessage("Invalid callback data");
      timeoutId = setTimeout(() => {
        router.push("/");
      }, 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 text-center border border-gray-800 shadow-2xl bg-gradient-to-br from-gray-900 to-black rounded-2xl"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-red-500/30 border-t-red-500 animate-spin" />
            <h2 className="text-xl font-bold text-white">Processing...</h2>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold text-white">Success!</h2>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-white">Error</h2>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
