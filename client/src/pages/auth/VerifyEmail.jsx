import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const VerifyEmail = () => {
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing token.");
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(response?.message || "Email verified successfully!");
        // Optional: redirect after a short delay
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. The token might have expired."
        );
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md text-center">
        {status === "verifying" && (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-500">Please wait while we confirm your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-green-600 text-xl font-bold mb-2">
              ✅ Email Verified!
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm mt-3 text-gray-400">
              Redirecting you to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-red-600 text-xl font-bold mb-2">
              ❌ Verification Failed
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
