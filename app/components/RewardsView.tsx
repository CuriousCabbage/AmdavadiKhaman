import { motion } from "framer-motion";

// Define the MenuItem interface here so TypeScript knows what to expect
interface MenuItem {
    id: number;
    name: string;
    price: number;
    image: string;
}

// We define rewards and link them to actual menu item IDs
export const REWARD_ITEMS = [
  // Make sure 'linkedMenuId' matches the actual IDs in your Firestore menuItems collection
  { id: "reward_chutney", name: "Extra Chutney", cost: 300, emoji: "🌿", linkedMenuId: 4 },
  { id: "reward_sev_khaman", name: "Free Sev Khaman", cost: 1200, emoji: "🍚", linkedMenuId: 1 },
];

interface RewardsViewProps {
  points: number;
  onRedeem: (reward: typeof REWARD_ITEMS[0], actualImage: string) => void; // Updated signature
  menuItems: MenuItem[]; // NEW: Needs access to real menu items
}

export default function RewardsView({ points, onRedeem, menuItems }: RewardsViewProps) {
  const goal = 300;
  const progress = Math.min((points / goal) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Rewards Program</h2>
        <p className="text-gray-500 mt-2">Earn points with every order and unlock free items.</p>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
               <p className="text-orange-50 font-medium mb-1">Your Points</p>
               <h3 className="text-5xl font-bold">{points} <span className="text-2xl font-normal">pts</span></h3>
            </div>
            <div className="text-right">
               <p className="text-orange-50 font-medium">Next Reward</p>
               <p className="font-bold text-xl">
                 {points < REWARD_ITEMS[0].cost ? REWARD_ITEMS[0].name : 
                  (points < REWARD_ITEMS[1].cost ? REWARD_ITEMS[1].name : "You can redeem all!")}
               </p>
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between text-sm font-medium text-orange-50">
                <span>Progress to {goal} pts</span>
                <span>{points} / {goal}</span>
             </div>
             <div className="h-4 bg-black/10 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-white rounded-full shadow-sm"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Rewards</h3>
        <div className="space-y-4">
          {REWARD_ITEMS.map((reward) => {
            const canAfford = points >= reward.cost;
            // Find the real menu item to get the correct image
            const menuProduct = menuItems.find(i => i.id === reward.linkedMenuId);
            // Use the real image if found, otherwise fall back to emoji placeholder
            const displayImage = menuProduct ? menuProduct.image : null;

            return (
              <div key={reward.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Image Container */}
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 overflow-hidden flex-shrink-0">
                    {displayImage ? (
                        <img src={displayImage} alt={reward.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{reward.emoji}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{reward.name}</h4>
                    <p className="text-sm text-gray-500">Add to your order for free</p>
                    <p className={`font-bold mt-1 ${canAfford ? "text-orange-600" : "text-gray-400"}`}>
                      {reward.cost} points
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    // Pass the reward data AND the correct image back up
                    if (canAfford) onRedeem(reward, displayImage || "");
                  }}
                  disabled={!canAfford}
                  className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 w-full sm:w-auto ${
                    canAfford 
                      ? 'bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-md cursor-pointer' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}