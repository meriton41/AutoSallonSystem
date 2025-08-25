"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(
        `https://localhost:7234/api/account/verify-email?token=${encodeURIComponent(
          token
        )}`
      );
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to verify email");
        if (data.message?.includes("expired")) {
          setShowResendButton(true);
        }
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while verifying your email");
      console.error("Verification error:", error);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(
        "https://localhost:7234/api/account/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: searchParams.get("email") }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Verification email resent successfully!");
        setShowResendButton(false);
      } else {
        setMessage(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      setMessage("An error occurred while resending the verification email");
      console.error("Resend error:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <div>
          <h2 style={{ color: "green" }}>{message}</h2>
          <p>You'll be redirected to the login page shortly...</p>
        </div>
      )}
      {status === "error" && (
        <div>
          <h2 style={{ color: "red" }}>{message}</h2>
          {showResendButton && (
            <button
              onClick={handleResendVerification}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Resend Verification Email
            </button>
          )}
          {!showResendButton && (
            <p>Please try again or contact support if the problem persists.</p>
          )}
        </div>
      )}
    </div>
  );
}
