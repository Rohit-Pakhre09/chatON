import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // ✅ Auto-hide error/success messages
    useEffect(() => {
        if (error || message) {
            const timer = setTimeout(() => {
                setError("");
                setMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, message]);

    // ✅ Handle SignUp
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!name.trim()) return setError("Name is required.");
        if (!/\S+@\S+\.\S+/.test(email)) return setError("Please enter a valid email address.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage("Account created successfully!");
            setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
            setTimeout(() => navigate("/signin"), 1500); // Redirect after 1.5s
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-200 w-full">
            <div className="w-[90%] sm:w-full max-w-md bg-neutral-50 rounded-2xl shadow-lg p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src="/src/assets/chatON-logo.png" alt="ChatON Logo" className="w-20 h-20" />
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    {/* Error / Message */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {message && <p className="text-green-600 text-sm">{message}</p>}

                    <button
                        type="submit"
                        className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-gray-600 text-sm text-center mt-4">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-blue-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

// ✅ Reusable Eye icons
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

export default SignUp;
