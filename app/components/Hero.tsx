import { motion } from "framer-motion";

interface HeroProps {
  userPoints: number;
  onOrderNow: () => void;
}

export default function Hero({ userPoints, onOrderNow }: HeroProps) {
  return (
    <div className="space-y-8">
      {/* Big Banner Image Area */}
      {/* Reverted height back to 400px */}
      <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-xl">
        
        {/* 1. The Base Image */}
        <img 
          src="/khandvi.jpeg" 
          alt="Food Banner" 
          className="w-full h-full object-cover"
        />

        {/* 2. THE FADING BLUR LAYER (Kept the new design) */}
        <div 
          className="absolute inset-y-0 left-0 w-full md:w-[70%] bg-black/50 backdrop-blur-md pointer-events-none"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
          }}
        />

        {/* 3. The Text Container */}
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          {/* Reverted padding to be slightly tighter */}
          <div className="max-w-lg py-6"> 
            {/* Reverted font size back to md:text-5xl */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              Taste Gujarat <br /> In every Bite!
            </h1>
            {/* Reverted font size back to standard text-lg */}
            <p className="mt-3 text-orange-100 text-lg max-w-md leading-relaxed drop-shadow-md">
              Order sev-khaman and more directly to your table. Earn rewards with each order.
            </p>
            <button 
              onClick={onOrderNow}
              className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-600/30 hover:-translate-y-1"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Points Banner & Stats (Unchanged) */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl shadow-sm">
            ✨
          </div>
          <div>
            <p className="text-gray-600 font-medium">Your Reward Points</p>
            <p className="text-3xl font-bold text-orange-600">{userPoints} <span className="text-lg text-gray-500 font-medium">points</span></p>
          </div>
        </div>
        <button className="bg-white border-2 border-orange-100 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition w-full md:w-auto">
          View Rewards
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Fast Delivery", desc: "Delivered in 30 minutes", icon: "🕒" },
          { title: "Earn Rewards", desc: "1 point for every dollar", icon: "🏅" },
          { title: "Track Orders", desc: "Real-time updates", icon: "🚚" },
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-default">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4">
              {feature.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg">{feature.title}</h3>
            <p className="text-gray-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
