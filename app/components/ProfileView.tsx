interface ProfileViewProps {
  user: any;
  profile: any;
}

export default function ProfileView({ user, profile }: ProfileViewProps) {
  // Prefer profile.displayName but fall back to auth user
  const displayName = profile?.displayName || user?.displayName || "Guest";
  const initial = displayName?.charAt(0) || "G";

  // Handle different createdAt shapes: Firestore Timestamp ({seconds}), Date, or toDate()
  let dateJoined = "Recent Member";
  const createdAt = profile?.createdAt;
  if (createdAt) {
    if (createdAt.seconds) {
      dateJoined = new Date(createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (typeof createdAt.toDate === "function") {
      dateJoined = createdAt.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else {
      dateJoined = new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-4">
         <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
         <p className="text-gray-500">Manage your account information</p>
      </div>

      {/* Top Card: User Info */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
          {initial}
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-900">{displayName}</h3>
          <p className="text-gray-500">Member since {dateJoined}</p>
        </div>
        <button className="border border-gray-300 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
          Edit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-center gap-4">
          <div className="text-3xl">🎗️</div>
          <div>
             <p className="text-gray-600 font-medium">Reward Points</p>
             <p className="text-2xl font-bold text-orange-600">{profile?.rewardPoints || 0} points</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center gap-4">
          <div className="text-3xl">👤</div>
          <div>
             <p className="text-gray-600 font-medium">Member Status</p>
             <p className="text-2xl font-bold text-green-600">Gold Member</p>
          </div>
        </div>
      </div>

      {/* Form Fields (Read Only for now) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
         <h4 className="font-bold text-lg mb-4">Personal Information</h4>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
               <div className="bg-gray-50 p-3 rounded-xl text-gray-800 border border-gray-200">
                  {user.displayName?.split(" ")[0]}
               </div>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
               <div className="bg-gray-50 p-3 rounded-xl text-gray-800 border border-gray-200">
                  {user.displayName?.split(" ")[1] || ""}
               </div>
            </div>
         </div>

         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <div className="bg-gray-50 p-3 rounded-xl text-gray-800 border border-gray-200">
               {user.email}
            </div>
         </div>
         
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
            <div className="bg-gray-50 p-3 rounded-xl text-gray-400 border border-gray-200 italic">
               +1 (555) 123-4567
            </div>
         </div>
      </div>
    </div>
  );
}