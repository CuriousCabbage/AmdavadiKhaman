import { motion } from "framer-motion";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface MenuSectionProps {
  items: MenuItem[];
  addToCart: (item: MenuItem) => void;
}

export default function MenuSection({ items, addToCart }: MenuSectionProps) {
  return (
    <div className="py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h2>
        <p className="text-gray-500 text-lg">
          Featuring our signature <span className="text-orange-600 font-bold">Sev Khaman</span> and traditional Gujarati specialties.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="h-48 bg-gray-50 rounded-xl overflow-hidden mb-4 relative group">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              {/* Quick Add Overlay Button */}
              <button 
                onClick={() => addToCart(item)}
                className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-orange-50 text-orange-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-start mb-1 px-1">
              <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
            </div>
            <p className="text-gray-400 text-xs mb-4 px-1 line-clamp-2">Freshly prepared with traditional spices.</p>
            
            <div className="mt-auto flex items-center justify-between px-1">
               <span className="font-bold text-xl text-gray-900">${item.price}</span>
               <button 
                 onClick={() => addToCart(item)} 
                 className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition"
               >
                 + Add
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}