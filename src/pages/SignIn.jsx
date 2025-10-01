import { useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [signInMessage, setSignInMessage] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");

    // Separate loading states
    const [isLoadingSignIn, setIsLoadingSignIn] = useState(false);
    const [isLoadingForgot, setIsLoadingForgot] = useState(false);
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (error || signInMessage || forgotMessage) {
            const timer = setTimeout(() => {
                setError("");
                setSignInMessage("");
                setForgotMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, signInMessage, forgotMessage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSignInMessage("");
        setIsLoadingSignIn(true);

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            setIsLoadingSignIn(false);
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoadingSignIn(false);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), { lastSeen: new Date() }, { merge: true });

            setSignInMessage("Signed in successfully!");
            setTimeout(() => navigate("/"), 1500);
        } catch {
            setError("Failed to sign in. Please check your email and password.");
        } finally {
            setIsLoadingSignIn(false);
        }
    };

    const handleForgotPassword = async () => {
        setError("");
        setForgotMessage("");
        setIsLoadingForgot(true);

        if (!email) {
            setError("Enter your email first to reset password.");
            setIsLoadingForgot(false);
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            setIsLoadingForgot(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setForgotMessage("Password reset link sent to your email.");
        } catch {
            setForgotMessage("Password reset link sent to your email.");
        } finally {
            setIsLoadingForgot(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoadingGoogle(true);
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            await setDoc(
                doc(db, "users", user.uid),
                {
                    displayName: user.displayName || user.email.split("@")[0],
                    email: user.email,
                    photoURL: user.photoURL || "",
                    lastSeen: new Date(),
                    createdAt: new Date(),
                },
                { merge: true }
            );

            setSignInMessage("Signed in with Google!");
            setTimeout(() => navigate("/"), 1500);
        } catch {
            setError("Failed to sign in with Google. Please try again.");
        } finally {
            setIsLoadingGoogle(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full">
            <div className="w-[90%] sm:w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-center mb-6">
                    <img src="/src/assets/chatON-logo.png" alt="ChatON Logo" className="w-20 h-20" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                    Sign In to ChatON
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-800 mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                            autoComplete="email"
                            aria-label="Email Address"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 mb-1 font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {signInMessage && <p className="text-blue-600 text-sm">{signInMessage}</p>}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isLoadingForgot}
                            className={`text-sm text-blue-600 hover:underline cursor-pointer ${isLoadingForgot ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {forgotMessage || (isLoadingForgot ? "Sending..." : "Forgot Password?")}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoadingSignIn}
                        className={`w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition cursor-pointer ${isLoadingSignIn ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isLoadingSignIn ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <hr className="flex-1 border-gray-300" />
                    <span className="px-2 text-gray-400 text-sm">OR</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoadingGoogle}
                    className={`w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer ${isLoadingGoogle ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google Logo"
                        className="w-5 h-5"
                    />
                    {isLoadingGoogle ? "Processing..." : "Continue with Google"}
                </button>

                <p className="text-gray-700 text-sm text-center mt-4">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-blue-600 font-medium hover:underline cursor-pointer">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

const Eye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M10.58 10.58A2 2 0 0112 8a2 2 0 012 2c0 .52-.2 1-.58 1.42m-2.84 0A2 2 0 0110 12a2 2 0 002 2c.52 0 1-.2 1.42-.58M21 12c-1.25 2.33-3.92 4.5-9 4.5-1.59 0-3.03-.29-4.3-.8M9.88 9.88A5.977 5.977 0 006 12c1.25-2.33 3.92-4.5 9-4.5 1.13 0 2.2.2 3.19.55" />
    </svg>
);

export default SignIn;
