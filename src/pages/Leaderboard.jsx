import React, { useEffect, useState } from "react";
import { Copy, Users, Star, Trophy, Target, Sparkles, Medal } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../hooks/useAuthStore";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuthStore();

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("role", "==", "user"),
          orderBy("xp", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const fetchedLeaders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(fetchedLeaders);
      } catch (e) {
        console.error("Error fetching leaderboard", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaders();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 font-semibold text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <Trophy className="w-4 h-4 mr-2" /> Top Explorers
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-6 tracking-tight"
        >
          Hall of Fame
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          The most active and experienced quest hunters in Georgia. Book quests, leave reviews, and invite friends to climb the ranks.
        </motion.p>
      </div>

      {loading ? (
        <div className="flex justify-center my-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative items-start">
          <div className="md:col-span-8 space-y-4">
            {leaders.map((user, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={user.id} 
                className={`relative bg-white/5 border ${index === 0 ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-yellow-500/5' : index === 1 ? 'border-gray-400/50 bg-gray-400/5' : index === 2 ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10'} backdrop-blur-xl p-4 md:p-6 rounded-2xl flex items-center gap-4`}
              >
                <div className="flex-shrink-0 w-12 text-center text-2xl font-black text-white/40">
                  #{index + 1}
                </div>
                
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-lg relative">
                  <Star className="w-6 h-6 text-white absolute opacity-20" />
                  <span className="font-bold text-white relative z-10 text-lg">
                    {user.name ? user.name.substring(0, 1).toUpperCase() : "?"}
                  </span>
                  {index === 0 && <Medal className="absolute -bottom-2 -right-2 w-6 h-6 text-yellow-500" fill="currentColor" />}
                  {index === 1 && <Medal className="absolute -bottom-2 -right-2 w-6 h-6 text-gray-400" fill="currentColor" />}
                  {index === 2 && <Medal className="absolute -bottom-2 -right-2 w-6 h-6 text-orange-500" fill="currentColor" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate">{user.name || "Anonymous Player"}</h3>
                  <div className="text-sm text-purple-400 font-medium truncate">{user.rank || "Beginner Explorer"}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center"><Target className="w-3 h-3 mr-1" /> {user.completedQuests || 0} Quests</span>
                    <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1" /> Lvl {user.level || 1}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                    {user.xp || 0}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">XP</div>
                </div>
              </motion.div>
            ))}
            
            {leaders.length === 0 && (
              <div className="text-center py-20 text-gray-500 border border-white/10 rounded-2xl border-dashed">
                Leaderboard is empty. Be the first to earn XP!
              </div>
            )}
          </div>

          <div className="md:col-span-4 space-y-6 md:sticky md:top-24">
            <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 p-6 md:p-8 rounded-2xl text-center shadow-[0_0_40px_rgba(168,85,247,0.1)]">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">How to earn XP?</h3>
              <p className="text-gray-400 text-sm mb-6">Level up and climb the leaderboard by being an active explorer.</p>
              
              <ul className="text-left space-y-4 mb-6">
                <li className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-300"><Target className="w-4 h-4 mr-2 text-purple-400" /> Book a Quest</span>
                  <span className="font-bold text-green-400">+50 XP</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-300"><Star className="w-4 h-4 mr-2 text-purple-400" /> Leave a Review</span>
                  <span className="font-bold text-green-400">+20 XP</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-300"><Users className="w-4 h-4 mr-2 text-purple-400" /> Invite a Friend</span>
                  <span className="font-bold text-green-400">+100 XP</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
