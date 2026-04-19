"use client"

import { useState, FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebase.browser";
import { COFFEE_PALETTE } from "../constants/theme";
import { Mail, AlertCircle, Coffee, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                const errorCode = (err as { code?: string }).code;
                switch (errorCode) {
                    case "auth/user-not-found":
                        setError("No account found with that email address");
                        break;
                    case "auth/invalid-email":
                        setError("Please enter a valid email address");
                        break;
                    case "auth/network-request-failed":
                        setError("Network error. Please check your connection");
                        break;
                    default:
                        setError("Failed to send reset email. Please try again");
                }
            } else {
                setError("Failed to send reset email. Please try again");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: COFFEE_PALETTE.background }}
        >
            <div className="w-full max-w-md">
                <div
                    className="p-8 rounded-lg shadow-lg border"
                    style={{
                        backgroundColor: COFFEE_PALETTE.cardBg,
                        borderColor: COFFEE_PALETTE.border,
                    }}
                >
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                            style={{ backgroundColor: COFFEE_PALETTE.primary }}
                        >
                            <Coffee className="w-8 h-8 text-white" />
                        </div>
                        <h1
                            className="text-2xl font-bold mb-2"
                            style={{ color: COFFEE_PALETTE.textPrimary }}
                        >
                            Reset Password
                        </h1>
                        <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    {error && (
                        <div
                            className="mb-6 p-4 rounded-lg border flex items-start gap-3"
                            style={{ backgroundColor: "#FFEBEE", borderColor: COFFEE_PALETTE.error }}
                        >
                            <AlertCircle
                                className="w-5 h-5 shrink-0 mt-0.5"
                                style={{ color: COFFEE_PALETTE.error }}
                            />
                            <p className="text-sm" style={{ color: COFFEE_PALETTE.error }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {success ? (
                        <div
                            className="mb-6 p-4 rounded-lg border flex items-start gap-3"
                            style={{ backgroundColor: "#E8F5E9", borderColor: "#4CAF50" }}
                        >
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                            <p className="text-sm text-green-700">
                                Check your email for a password reset link.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: COFFEE_PALETTE.textPrimary }}
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                        style={{ color: COFFEE_PALETTE.textSecondary }}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="admin@coffix.co.nz"
                                        disabled={loading}
                                        className="w-full pl-11 pr-4 py-3 rounded-md border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: COFFEE_PALETTE.border,
                                            color: COFFEE_PALETTE.textPrimary,
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-3 px-4 rounded-md font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ backgroundColor: COFFEE_PALETTE.primary }}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-sm hover:underline"
                            style={{ color: COFFEE_PALETTE.primary }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
