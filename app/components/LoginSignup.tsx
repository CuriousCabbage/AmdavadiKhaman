import { useState } from "react";
import { toast } from "react-hot-toast";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase"; // Assuming firebase is configured
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface LoginSignupProps {
  onLoginSuccess: (user: any) => void;
  onContinueAsGuest?: () => void; // Optional for guests to proceed
  showGuestOption?: boolean;
  onSwitchToLogin?: () => void; // For switching between login/signup states in parent
}

export default function LoginSignup({ onLoginSuccess, onContinueAsGuest, showGuestOption = false }: LoginSignupProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For registration

  const handleEmailAuth = async () => {
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update the Auth user profile so user.displayName is available immediately
        await updateProfile(user, { displayName: name });

        // Create user profile in Firestore using serverTimestamp for consistent shape
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: name,
          email: user.email,
          rewardPoints: 0,
          createdAt: serverTimestamp(),
        });

        toast.success(`Welcome, ${name}! Your account is ready.`);
        // Pass an updated user object (with displayName) so UI updates immediately
        onLoginSuccess({ ...user, displayName: name });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
        onLoginSuccess(userCredential.user);
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      let errorMessage = "Authentication failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore, create if not
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef); // Make sure getDoc is imported from firestore
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          rewardPoints: 0,
          createdAt: new Date(),
        });
      }
      toast.success(`Welcome back, ${user.displayName?.split(" ")[0]}!`);
      onLoginSuccess(user);
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-100 mt-20">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {isRegistering ? "Create Account" : "Welcome Back"}
      </h2>

      {isRegistering && (
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="Your Name"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          placeholder="email@example.com"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          placeholder="********"
        />
      </div>

      <button
        onClick={handleEmailAuth}
        className="w-full bg-black text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-md"
      >
        {isRegistering ? "Sign Up" : "Login"}
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-md"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 11v2.4h3.97c-.16 1.02-.66 1.83-1.35 2.39.97.67 2.09 1.07 3.32 1.07 1.68 0 3.24-.59 4.33-1.95 1.1-.96 1.74-2.22 1.74-3.79 0-.23-.01-.45-.03-.67H22V11h-2.14z" fill="#4285F4"/>
          <path d="M3 11l-.01 2.4c0 1.57.54 2.83 1.48 3.79.68 1.43 1.72 2.44 3 3.12 1.13.56 2.37.89 3.65.89 2.22 0 4.1-.73 5.46-2.01L19.46 17c-1.2-1.2-2.7-1.89-4.33-1.89-1.23 0-2.35.4-3.32 1.07-.69-.56-1.19-1.37-1.35-2.39L7 11H3z" fill="#34A853"/>
          <path d="M12.01 6.95c-.86-.5-1.76-.8-2.76-.8-.88 0-1.7.2-2.45.54C5.9 7.4 5.25 8.1 4.7 8.95c-.55.85-.92 1.8-.92 2.85V11H3V8.6c0-1.05.37-2.02.92-2.87.55-.85 1.2-1.55 1.95-2.1.75-.34 1.57-.54 2.45-.54 1 0 1.9.3 2.76.8L12.01 6.95z" fill="#FBBC05"/>
          <path d="M12.01 6.95l-.65-1.13c-.86-.5-1.76-.8-2.76-.8-.88 0-1.7.2-2.45.54C5.9 7.4 5.25 8.1 4.7 8.95c-.55.85-.92 1.8-.92 2.85V11H3V8.6c0-1.05.37-2.02.92-2.87.55-.85 1.2-1.55 1.95-2.1.75-.34 1.57-.54 2.45-.54 1 0 1.9.3 2.76.8L12.01 6.95z" fill="#EA4335"/>
        </svg>
        Login with Google
      </button>

      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="w-full text-center text-sm text-gray-500 hover:text-orange-600 mt-6 transition"
      >
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </button>

      {showGuestOption && (
        <button
          onClick={onContinueAsGuest}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-4 transition"
        >
          Continue as Guest
        </button>
      )}
    </div>
  );
}