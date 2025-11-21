"use client";
import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, db } from "./lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, addDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Import components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import OrdersView from "./components/OrdersView";
import RewardsView, { REWARD_ITEMS } from "./components/RewardsView"; 
import ProfileView from "./components/ProfileView";
import LoginSignup from "./components/LoginSignup"; 

// --- Interfaces ---
interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
}
interface CartItem {
  id: string | number; 
  name: string;
  price: number;
  image: string;
  quantity: number;
  isReward?: boolean; 
  pointsCost?: number; 
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentView, setCurrentView] = useState("home");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [showPreCheckoutAuth, setShowPreCheckoutAuth] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState<string | null>(null);
  const [guestOrderPoints, setGuestOrderPoints] = useState<number>(0);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // --- Auth State Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser.uid);
        setIsGuestMode(false);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- NEW: Handle Browser Back Button to Close Login Screen ---
  useEffect(() => {
    // If we are stuck on the login screen (and not logged in)
    if (!user && !isGuestMode) {
      // Push a state so the back button has something to "pop"
      window.history.pushState({ loginOpen: true }, "");

      const handlePopState = () => {
        // When back button is pressed, enable guest mode (closing login screen)
        setIsGuestMode(true);
        setShowPreCheckoutAuth(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [user, isGuestMode]);

  // --- NEW: Navigation Handler for Navbar ---
  const handleNavbarNavigation = (view: string) => {
    setCurrentView(view);
    // Critical Fix: Force guest mode ON so the login blocker disappears
    setIsGuestMode(true);
    setShowPreCheckoutAuth(false);
  };

  // --- Data Fetching ---
  const fetchMenu = async () => {
    try {
      const menuQuery = query(collection(db, "menuItems"), orderBy("id"));
      const querySnapshot = await getDocs(menuQuery);
      const items: MenuItem[] = [];
      querySnapshot.forEach((doc) => { items.push(doc.data() as MenuItem); });
      setMenuItems(items);
    } catch (error) { console.error(error); toast.error("Failed to load menu."); }
  };

  const fetchUserProfile = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        setUserProfile(docSnap.data());
    } else {
        const newProfile = {
          uid: uid,
          displayName: auth.currentUser?.displayName || "Guest",
          email: auth.currentUser?.email || "guest@example.com",
          rewardPoints: 0,
          createdAt: serverTimestamp(), 
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
    }
  };

  useEffect(() => { fetchMenu(); if (user) fetchUserProfile(user.uid); }, [user]);

  const handleLoginSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser);
    await fetchUserProfile(loggedInUser.uid); 
    setIsGuestMode(false);
    setShowPreCheckoutAuth(false); 
    setCurrentView("home");

    try {
      if (guestOrderId) {
        const orderRef = doc(db, "orders", guestOrderId);
        await updateDoc(orderRef, { userId: loggedInUser.uid });
        if (guestOrderPoints > 0) {
          await updateDoc(doc(db, "users", loggedInUser.uid), { rewardPoints: increment(guestOrderPoints) });
          setUserProfile((prev: any) => ({ ...(prev || {}), rewardPoints: (prev?.rewardPoints || 0) + guestOrderPoints }));
          toast.success(`Order attached and ${guestOrderPoints} points added to your account!`);
        } else {
          toast.success("Order attached to your account.");
        }
        setGuestOrderId(null);
        setGuestOrderPoints(0);
      }
    } catch (err) {
      console.error("Failed to attach guest order:", err);
    }
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsGuestMode(true);            
    setShowPreCheckoutAuth(false);   
    setCart([]);
    setCurrentView("home");
    toast("See you next time!", { icon: "👋" });
  };

  const addToCart = (item: MenuItem) => {
    toast.success(`Added ${item.name}`);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && !i.isReward); 
      return existing 
        ? prev.map((i) => i.id === item.id && !i.isReward ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRedeemReward = async (reward: typeof REWARD_ITEMS[0], actualImage: string) => {
      if (!userProfile || userProfile.rewardPoints < reward.cost) {
          toast.error("Not enough points!");
          return;
      }

      const newPoints = userProfile.rewardPoints - reward.cost;
      setUserProfile({ ...userProfile, rewardPoints: newPoints }); 
      await updateDoc(doc(db, "users", user.uid), { rewardPoints: increment(-reward.cost) });

      const rewardItem: CartItem = {
          id: `reward_${reward.id}_${Date.now()}`, 
          name: reward.name,
          price: 0, 
          image: actualImage,
          quantity: 1,
          isReward: true,
          pointsCost: reward.cost
      };

      setCart(prev => [...prev, rewardItem]);
      toast.success("Redeemed! Item added to cart.");
  };

  const removeFromCart = async (item: CartItem) => {
    if (item.isReward && item.pointsCost) {
        const refundAmount = item.pointsCost * item.quantity;
        if (userProfile) {
            setUserProfile({ ...userProfile, rewardPoints: userProfile.rewardPoints + refundAmount });
        }
        if (user) {
            await updateDoc(doc(db, "users", user.uid), { rewardPoints: increment(refundAmount) });
        }
        toast.success(`Removed reward. ${refundAmount} points refunded.`);
    } else {
        toast.error("Item removed.");
    }

    setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing && existing.quantity > 1) {
             return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
        } else {
             return prev.filter((i) => i.id !== item.id);
        }
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const pointsToEarn = Math.floor(cartTotal * 10); 

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!user) {
      try {
        const guestPoints = Math.floor(cartTotal * 10);
        const orderRef = await addDoc(collection(db, "orders"), { 
            userId: null, guestCart: cart, total: cartTotal, pointsEarned: guestPoints, createdAt: new Date(), status: "guest_pending" 
        });
        setGuestOrderId(orderRef.id);
        setGuestOrderPoints(guestPoints);
        setCart([]);
        setShowPreCheckoutAuth(true); 
        setCurrentView("home");
        toast.success(`Order placed as guest! ${guestPoints} points waiting — sign up to claim them.`);
        return;
      } catch (error) { console.error(error); toast.error("Guest order failed."); return; }
    }
    
    try {
      await addDoc(collection(db, "orders"), { 
          userId: user.uid, items: cart, total: cartTotal, pointsEarned: pointsToEarn, createdAt: new Date(), status: "pending" 
      });
      await updateDoc(doc(db, "users", user.uid), { rewardPoints: increment(pointsToEarn) });
      setUserProfile({ ...userProfile, rewardPoints: (userProfile.rewardPoints || 0) + pointsToEarn });
      setCart([]);
      toast.success(`Order placed! +${pointsToEarn} points`);
      setCurrentView("orders");
    } catch (error) { console.error(error); toast.error("Order failed."); }
  };

  // --- View Rendering ---
  const renderContent = () => {
    if (loadingAuth) return <div className="flex justify-center h-[50vh] items-center">Loading...</div>;

    if (!user && !isGuestMode) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <h1 className="text-6xl font-extrabold mb-6 text-gray-900 tracking-tighter">Amdavadi <span className="text-orange-600">Khaman</span></h1>
                <p className="text-xl text-gray-500 mb-10 max-w-lg">Authentic Taste of Gujarat. Delivered fresh to your doorstep.</p>
                <LoginSignup onLoginSuccess={handleLoginSuccess} showGuestOption={true} onContinueAsGuest={() => setIsGuestMode(true)} />
            </div>
        );
    }

    switch (currentView) {
      case "home":
        return (
          <div className="space-y-10">
            <Hero userPoints={userProfile?.rewardPoints || 0} onOrderNow={() => setCurrentView("menu")} />
            <MenuSection items={menuItems} addToCart={addToCart} />
          </div>
        );
      
      case "menu": return <MenuSection items={menuItems} addToCart={addToCart} />;

      case "orders":
        if (!user) return <div className="text-center py-20">Please login to view orders.</div>;
        return <OrdersView userId={user.uid} />;

      case "rewards":
        if (!user) return <div className="text-center py-20">Please login to view rewards.</div>;
        return <RewardsView 
                  points={userProfile?.rewardPoints || 0} 
                  onRedeem={handleRedeemReward}
                  menuItems={menuItems} 
               />;

      case "profile":
        if (!user) return <div className="text-center py-20">Please login to view profile.</div>;
        return <ProfileView user={user} profile={userProfile} />;

      case "cart":
        return (
            <div className="max-w-3xl mx-auto">
                {showPreCheckoutAuth && (
                    <div className="mb-8 bg-orange-50 p-6 rounded-2xl text-center border border-orange-200">
                        <h3 className="text-xl font-bold text-orange-800 mb-2">Log in to checkout</h3>
                        <LoginSignup onLoginSuccess={handleLoginSuccess} />
                    </div>
                )}
                
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full">🎁</span>}
                                        </div>
                                        <div>
                                            <p className="font-bold flex items-center gap-2">
                                                {item.name}
                                                {item.isReward && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Reward</span>}
                                            </p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold ${item.isReward ? "text-green-600" : ""}`}>
                                            {item.isReward ? "FREE" : `$${(item.price * item.quantity).toFixed(2)}`}
                                        </span>
                                        <button 
                                            onClick={() => removeFromCart(item)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                                            title="Remove item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between items-center text-xl font-bold">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-center text-green-600 font-semibold mt-4">
                                You will earn {pointsToEarn} reward points with this order! ✨
                            </p>
                            <button 
                                onClick={handleCheckout} 
                                className="w-full mt-6 bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition"
                                disabled={cart.length === 0}
                            >
                                {user ? `Checkout (${cartTotal.toFixed(2)})` : `Login to Checkout (${cartTotal.toFixed(2)})`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
          
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <Toaster position="top-center" />
      <Navbar 
        currentView={currentView} 
        setCurrentView={handleNavbarNavigation} // <--- CHANGED: Now uses the safe handler!
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        user={user}
        handleLogout={handleLogout}
        onShowLogin={() => { setIsGuestMode(false); setShowPreCheckoutAuth(false); setCurrentView("home"); }}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div key={currentView} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}