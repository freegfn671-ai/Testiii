import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { User, LogOut, Settings, Heart, Calendar, Trophy, Users, Star, Award, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, userData, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetch("/api/bookings", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => setBookings(data || []))
        .catch(console.error);
    } else if (activeTab === "favorites") {
      fetch("/api/favorites", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => setFavorites(data || []))
        .catch(console.error);
    } else if (activeTab === "referrals") {
      fetch("/api/referrals", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => setReferrals(data || []))
        .catch(console.error);
    }
  }, [activeTab]);

  if (!user) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your profile.</h2>
        <button onClick={() => navigate("/login")} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Log In</button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone")
        })
      });
      if (res.ok) {
        toast.success("Profile updated!");
      }
    } catch (e) {
      toast.error("Failed to update profile");
    }
  };

  const copyReferral = () => {
    const link = `${window.location.origin}/login?ref=${userData?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress to next level
  const nextLevelXp = (userData?.level || 1) * 1000;
  const progressPercent = Math.min(100, Math.max(0, ((userData?.xp || 0) / nextLevelXp) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">My Profile</h1>
          <p className="text-gray-400">Manage your account and view achievements</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-rose-500 hover:text-rose-400 font-semibold transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-purple-900 rounded-full flex items-center justify-center text-purple-200 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] border-2 border-purple-500">
                <User size={48} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-black flex items-center">
                <Star size={12} className="mr-1" /> Lvl {userData?.level || 1}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white max-w-full overflow-hidden text-ellipsis">
              {userData?.name || "Player"}
            </h3>
            <div className="text-purple-400 font-medium text-sm my-1">{userData?.rank || "Beginner Explorer"}</div>
            
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{userData?.xp || 0} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {userData?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
              >
                Admin Dashboard
              </button>
            )}
            {userData?.role === "manager" && (
              <button
                onClick={() => navigate("/manager")}
                className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
              >
                Manager Dashboard
              </button>
            )}
          </div>

          <nav className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden p-2 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("account")}
              className={`flex items-center space-x-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'account' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Settings size={18} /> <span>Account Settings</span>
            </button>
            <button 
              onClick={() => setActiveTab("achievements")}
              className={`flex items-center space-x-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'achievements' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Trophy size={18} /> <span>Achievements</span>
            </button>
            <button 
              onClick={() => setActiveTab("referrals")}
              className={`flex items-center space-x-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'referrals' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Users size={18} /> <span>Refer Friends</span>
            </button>
            <button 
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center space-x-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'bookings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Calendar size={18} /> <span>My Bookings</span>
            </button>
            <button 
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center space-x-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'favorites' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Heart size={18} /> <span>Favorites</span>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 min-h-[400px]">
            {activeTab === 'account' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Account Settings</h3>
                <form onSubmit={handleUpdate} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                    <input name="name" type="text" defaultValue={userData?.name} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input type="email" disabled defaultValue={userData?.email || user.email} className="w-full bg-black/50 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                    <input name="phone" type="tel" defaultValue={userData?.phone} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                  </div>
                  <button type="submit" className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-lg transition-colors">
                    Save Changes
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'achievements' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Achievements</h3>
                  <div className="text-purple-400 font-bold bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20">
                    {userData?.completedQuests || 0} Quests Completed
                  </div>
                </div>
                
                {/* Mocked Full Achievements List tailored to description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   {[
                     { id: 'first_quest', title: 'First Quest', description: 'Complete your first quest experience.', icon: '🏆', rarity: 'common', unlocked: (userData?.completedQuests || 0) >= 1 },
                     { id: 'five_quests', title: '5 Completed Quests', description: 'Become a seasoned survivor.', icon: '🖐️', rarity: 'uncommon', unlocked: (userData?.completedQuests || 0) >= 5 },
                     { id: 'horror_master', title: 'Horror Master', description: 'Survive 3 horror quests.', icon: '👻', rarity: 'rare', unlocked: false },
                     { id: 'detective_expert', title: 'Detective Expert', description: 'Solve 3 detective cases.', icon: '🔍', rarity: 'rare', unlocked: false },
                     { id: 'team_player', title: 'Team Player', description: 'Book a quest for 6 players.', icon: '🤝', rarity: 'uncommon', unlocked: false },
                     { id: 'night_explorer', title: 'Night Explorer', description: 'Play a quest after 10 PM.', icon: '🌙', rarity: 'epic', unlocked: false },
                     { id: '10_reviews', title: '10 Reviews', description: 'Leave 10 quest reviews.', icon: '📝', rarity: 'epic', unlocked: false },
                     { id: 'referral_king', title: 'Referral King', description: 'Invite 5 friends successfully.', icon: '👑', rarity: 'legendary', unlocked: referrals.length >= 5 },
                   ].map((a) => (
                     <div key={a.id} className={`p-4 rounded-xl border flex items-center space-x-4 transition-all ${a.unlocked ? (
                       a.rarity === 'common' ? 'bg-gradient-to-br from-gray-800 to-black border-gray-600' :
                       a.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-900/40 to-black border-green-500/30' :
                       a.rarity === 'rare' ? 'bg-gradient-to-br from-blue-900/40 to-black border-blue-500/30' :
                       a.rarity === 'epic' ? 'bg-gradient-to-br from-purple-900/40 to-black border-purple-500/30' :
                       'bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                     ) : 'bg-black/40 border-white/5 opacity-50 grayscale hover:grayscale-0'}`}>
                       <div className={`p-3 rounded-lg text-2xl ${a.unlocked ? 'bg-white/10' : 'bg-white/5'}`}>
                         {a.icon}
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-start">
                           <div className="font-bold text-white">{a.title}</div>
                           {a.unlocked && <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 bg-white/10 px-2 py-0.5 rounded">{a.rarity}</span>}
                         </div>
                         <div className="text-sm text-gray-400 mt-1">{a.description}</div>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Refer Friends & Earn</h3>
                <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-xl p-6 mb-8 text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Invite friends, get 100 XP!</h4>
                  <p className="text-gray-300 mb-6 text-sm">Share your unique link. When they register, you both get bonuses!</p>
                  <div className="flex items-center max-w-sm mx-auto bg-black p-2 rounded-lg border border-white/10">
                    <input 
                      readOnly 
                      value={`${window.location.origin}/login?ref=${userData?.referralCode}`} 
                      className="flex-1 bg-transparent px-2 text-sm text-gray-300 focus:outline-none"
                    />
                    <button onClick={copyReferral} className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white">
                      {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-4">Your Referrals</h4>
                {referrals.length === 0 ? (
                  <p className="text-gray-500">You haven't referred anyone yet.</p>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((r, i) => (
                      <div key={i} className="bg-black/50 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{r.invitedName || "Unknown User"}</div>
                          <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full text-sm">
                          +{r.reward} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'bookings' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">My Bookings</h3>
                {bookings.length === 0 ? (
                  <p className="text-gray-400">You have no bookings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(b => (
                      <div key={b.id} className="bg-black/50 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg">{b.questName}</div>
                          <div className="text-sm text-gray-400">{b.date} • {b.time}</div>
                          <div className="text-sm text-gray-400">{b.participants} players</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-400">{b.totalPrice}$</div>
                          <div className="text-sm uppercase tracking-widest bg-white/10 px-2 py-1 rounded inline-block mt-2 text-gray-300">{b.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Favorites</h3>
                {favorites.length === 0 ? (
                  <p className="text-gray-400">You have no favorited quests.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map(q => (
                      <div key={q.id} onClick={() => navigate(`/quests/${q.slug}`)} className="cursor-pointer bg-black/50 border border-white/10 p-4 rounded-xl flex items-center space-x-4 hover:border-purple-500 transition-colors">
                        <div className="w-16 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                          {q.imageUrl ? <img src={q.imageUrl} alt={q.title} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{q.title}</div>
                          <div className="text-sm text-gray-400">{q.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
