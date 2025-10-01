import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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

    useEffect(() => {
        if (error || message) {
            const timer = setTimeout(() => {
                setError("");
                setMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // Validation
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Firebase Auth profile
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                displayName: name,
                email: user.email,
                photoURL: "",
                lastSeen: new Date(),
                createdAt: new Date(),
            });

            // Success
            setMessage("Account created successfully!");
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/signin"), 1500);
        } catch (err) {
            // Handle specific Firebase errors
            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("Email is already in use.");
                    break;
                case "auth/invalid-email":
                    setError("Invalid email format.");
                    break;
                case "auth/weak-password":
                    setError("Password is too weak.");
                    break;
                default:
                    setError("Failed to create account. Please try again.");
                    console.error("Sign-up error:", err);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] w-full">
            <div className="w-[90%] sm:w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/src/assets/chatON-logo.png"
                        alt="ChatON Logo"
                        className="w-20 h-20"
                    />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Create Your Account
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        <label className="block text-gray-700 mb-1 font-medium">
                            Password
                        </label>
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
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">
                            Confirm Password
                        </label>
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
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <p className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </p>
                    )}
                    {message && (
                        <p className="text-blue-600 text-sm text-center font-medium">
                            {message}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-200 cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>

                {/* Redirect */}
                <p className="text-gray-600 text-sm text-center mt-5">
                    Already have an account?{" "}
                    <Link
                        to="/signin"
                        className="text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;