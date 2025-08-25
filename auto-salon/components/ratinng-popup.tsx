"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?:
    | string
    | string[];
}

export function RatingPopup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAlreadyRatedDialog, setShowAlreadyRatedDialog] = useState(false);

  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    console.log("localStorage keys:", Object.keys(localStorage));
    console.log("sessionStorage keys:", Object.keys(sessionStorage));
    // Try to parse token from 'user' key in localStorage
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.token) {
          console.log("Token found in user key");
          return userData.token;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("token");
    console.log("Retrieved token:", token);
    return token;
  };

  const clearAuthTokens = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
  };

  const getUserIdentifier = (decoded: JwtPayload): string | null => {
    return (
      decoded.sub ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      decoded.email ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] ||
      null
    );
  };

  const checkServerRatingStatus = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        "https://localhost:7234/api/WebsiteRatings/hasRated",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.status === 401) {
        clearAuthTokens();
        return false;
      }

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.hasRated || false;
    } catch (error) {
      console.error("Error checking rating status:", error);
      return false;
    }
  };

  const checkAuthAndRatingStatus = async () => {
    setIsCheckingAuth(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);
      const userIdentifier = getUserIdentifier(decoded);

      if (!userIdentifier) {
        toast.error("Authentication error. Please login again.", {
          action: {
            label: "Login",
            onClick: () => router.push("/login"),
          },
        });
        setIsCheckingAuth(false);
        return;
      }

      setUserId(userIdentifier);

      const localStorageKey = `hasRated-${userIdentifier}`;
      const localHasRated = localStorage.getItem(localStorageKey) === "true";
      const serverHasRated = localHasRated
        ? true
        : await checkServerRatingStatus(token);

      setHasRated(localHasRated || serverHasRated);
    } catch (error) {
      console.error("Auth check error:", error);
      toast.error("Failed to verify authentication status");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleOpenDialog = () => {
    try {
      if (hasRated) {
        toast.info("You have already submitted your rating. Thank you!");
        return;
      }

      const token = getAuthToken();

      if (!token) {
        toast.error("Please login to rate our website", {
          action: {
            label: "Login",
            onClick: () => router.push("/login"),
          },
        });
        return;
      }

      setOpen(true);
    } catch (error) {
      console.error("Dialog open error:", error);
      toast.error("Failed to open rating form");
    }
  };

  const submitRating = async () => {
    console.log("submitRating called");
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      console.log("Token:", token);

      if (!token) {
        toast.error("Session expired. Please login again.", {
          action: {
            label: "Login",
            onClick: () => router.push("/login"),
          },
        });
        setOpen(false);
        return;
      }

      if (rating === 0) {
        toast.error("Please select a rating");
        return;
      }

      console.log("Submitting rating:", rating, comment);

      const response = await fetch(
        "https://localhost:7234/api/WebsiteRatings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            value: rating,
            comment: comment || null,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (response.status === 401) {
        clearAuthTokens();
        toast.error("Session expired. Please login again.", {
          action: {
            label: "Login",
            onClick: () => router.push("/login"),
          },
        });
        setOpen(false);
        return;
      }

      if (!response.ok) {
        let errorMessage = "Failed to submit rating";
        const contentType = response.headers.get("content-type");
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
          console.error("Error reading error response:", e);
        }

        if (errorMessage.includes("already submitted a rating")) {
          setHasRated(true);
          localStorage.setItem(`hasRated-${userId}`, "true");
          setOpen(false);
          setShowAlreadyRatedDialog(true);
          return;
        }
        
        throw new Error(errorMessage);
      }

      localStorage.setItem(`hasRated-${userId}`, "true");
      setHasRated(true);
      setIsSuccess(true);
      toast.success("Thank you for your feedback!");

      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        setRating(0);
        setComment("");
      }, 1500);
    } catch (error) {
      console.error("Rating submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    checkAuthAndRatingStatus();

    const handleOpenEvent = () => setOpen(true);
    window.addEventListener("open-rating-dialog", handleOpenEvent);

    return () => {
      window.removeEventListener("open-rating-dialog", handleOpenEvent);
    };
  }, []);

  if (isCheckingAuth) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="z-[1000] max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>Your feedback helps us improve</DialogDescription>
          </DialogHeader>
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold">Thank You!</h3>
              <p className="text-muted-foreground">
                Your rating has been submitted successfully.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`text-3xl focus:outline-none ${
                      star <= (hover || rating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`${star} star`}
                  >
                    {star <= (hover || rating) ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <textarea
                className="border rounded p-2 min-h-[100px] bg-gray-900 text-white"
                placeholder="Optional feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                onClick={submitRating}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAlreadyRatedDialog} onOpenChange={setShowAlreadyRatedDialog}>
        <DialogContent className="z-[1000] max-w-md">
          <DialogHeader>
            <DialogTitle>Already Rated</DialogTitle>
            <DialogDescription>Thank you for your feedback!</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-semibold">You've Already Rated Us</h3>
            <p className="text-muted-foreground text-center mt-2">
              We appreciate your previous feedback. Thank you for helping us improve!
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowAlreadyRatedDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
