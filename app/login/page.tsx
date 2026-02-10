"use client"

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebase.browser";
import { COFFEE_PALETTE } from "../constants/theme";
import { Mail, Lock, LogIn, AlertCircle, Coffee } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const auth = getAuth(app);
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: unknown) {
            console.error("Login error:", err);
            if (err instanceof Error) {
                const errorCode = (err as { code?: string }).code;
                switch (errorCode) {
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        setError("Invalid email or password");
                        break;
                    case 'auth/too-many-requests':
                        setError("Too many failed attempts. Please try again later");
                        break;
                    case 'auth/network-request-failed':
                        setError("Network error. Please check your connection");
                        break;
                    default:
                        setError("Login failed. Please try again");
                }
            } else {
                setError("Login failed. Please try again");
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
                        borderColor: COFFEE_PALETTE.border
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
                            Coffix Server Printer Dashboard 
                        </h1>
                        <p 
                            className="text-sm"
                            style={{ color: COFFEE_PALETTE.textSecondary }}
                        >
                            Admin Login
                        </p>
                    </div>

                    {error && (
                        <div 
                            className="mb-6 p-4 rounded-lg border flex items-start gap-3"
                            style={{ 
                                backgroundColor: '#FFEBEE',
                                borderColor: COFFEE_PALETTE.error
                            }}
                        >
                            <AlertCircle 
                                className="w-5 h-5 shrink-0 mt-0.5"
                                style={{ color: COFFEE_PALETTE.error }}
                            />
                            <p 
                                className="text-sm"
                                style={{ color: COFFEE_PALETTE.error }}
                            >
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
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
                                        color: COFFEE_PALETTE.textPrimary
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label 
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: COFFEE_PALETTE.textPrimary }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock 
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: COFFEE_PALETTE.textSecondary }}
                                />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className="w-full pl-11 pr-4 py-3 rounded-md border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ 
                                        borderColor: COFFEE_PALETTE.border,
                                        color: COFFEE_PALETTE.textPrimary
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full py-3 px-4 rounded-md font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: COFFEE_PALETTE.primary }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p 
                            className="text-xs"
                            style={{ color: COFFEE_PALETTE.textSecondary }}
                        >
                            Admin access only. Contact IT for credentials.
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p 
                        className="text-xs"
                        style={{ color: COFFEE_PALETTE.textSecondary }}
                    >
                        © 2026 Coffee System v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
