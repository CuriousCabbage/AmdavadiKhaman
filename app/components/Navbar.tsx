interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  cartCount: number;
  user: any;
  handleLogout: () => void;
  onShowLogin?: () => void;
}

export default function Navbar({ currentView, setCurrentView, cartCount, user, handleLogout, onShowLogin }: any) {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "menu", label: "Menu", icon: "🍔" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "rewards", label: "Rewards", icon: "🎁" },
    { id: "profile", label: "Profile", icon: "👤" }, 
  ];

  return (
    <>
      {/* --- DESKTOP/TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          
          {/* LOGO SECTION */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setCurrentView("home")}
          >
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-extrabold text-xl shadow-[4px_4px_12px_-2px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[6px_6px_16px_-2px_rgba(0,0,0,0.4)]">
              A
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="hidden md:flex flex-col leading-none select-none">
              <span className="font-extrabold text-lg text-gray-900 tracking-tight group-hover:text-black transition-colors duration-300">
                Amdavadi
              </span>
              <span className="text-xs font-bold text-orange-600 tracking-[0.2em] uppercase">
                Khaman
              </span>
            </div>
          </div>

          {/* CENTER NAVIGATION (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100/50 p-1 rounded-full border border-gray-100">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-black text-white shadow-md transform scale-105" 
                      : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* RIGHT SIDE (Cart & Login) */}
          <div className="flex items-center gap-4">
            <button 
               onClick={() => setCurrentView("cart")}
               className="relative p-3 bg-white hover:bg-gray-50 rounded-full transition-all border border-gray-100 shadow-sm hover:shadow-md group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => {
                if (user) {
                  handleLogout();
                } else {
                  if (onShowLogin) onShowLogin();
                  else setCurrentView("home");
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-bold shadow-lg shadow-gray-200 hover:shadow-gray-300 hover:scale-105 transition-all duration-300"
            >
              {user ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION (New!) --- */}
      {/* md:hidden means it ONLY shows on mobile screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                  isActive ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {/* The icon */}
                <span className={`text-2xl transition-transform duration-200 ${isActive ? "-translate-y-1 drop-shadow-sm" : ""}`}>
                  {item.icon}
                </span>
                {/* The label */}
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? "opacity-100" : "opacity-0 scale-0"} transition-all duration-200`}>
                  {item.label}
                </span>
                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute bottom-1 w-1 h-1 bg-orange-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Just adding this import locally so the motion dot works without adding import to top of file if you copy/paste the whole thing
import { motion } from "framer-motion";
