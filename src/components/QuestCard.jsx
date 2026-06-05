import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Star, Users, Ghost, ShieldCheck, Crown } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import toast from "react-hot-toast";

export default function QuestCard({ quest }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      // Small optimization: normally you fetch this on parent to avoid N requests.
      // But for preview it works!
      fetch("/api/favorites", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data && data.find(q => q.id === quest.id)) setIsFavorite(true);
      })
      .catch(() => {});
    }
  }, [user, quest.id]);

  const handleCardClick = () => {
    navigate(`/${i18n.language}/quest/${quest.slug || quest.title.toLowerCase().replace(/ /g, "-")}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to add favorites.");
      return;
    }
    const method = isFavorite ? "DELETE" : "POST";
    const endpoint = isFavorite ? `/api/favorites/${quest.id}` : `/api/favorites`;
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: method === "POST" ? JSON.stringify({ questId: quest.id }) : undefined
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      }
    } catch (e) {
      toast.error("Failed to update favorites");
    }
  };

  const handleBookNowClick = (e) => {
    e.stopPropagation();
    // navigate directly to booking section of the quest detail page
    navigate(`/${i18n.language}/quest/${quest.slug || quest.title.toLowerCase().replace(/ /g, "-")}#booking`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative backdrop-blur-md rounded-2xl overflow-hidden border hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col h-full cursor-pointer z-20 pointer-events-auto ${quest.isQuestOfTheMonth ? 'bg-[#1a0b2e]/90 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-[#070709]/80 border-white/10 hover:border-purple-500/50'}`}
    >
      {/* Spotlight Effect for Quest of the Month */}
      {quest.isQuestOfTheMonth && (
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] z-0 pointer-events-none" />
      )}

      {/* Image container */}
      <div className="relative h-56 w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] to-transparent z-10 opacity-80" />
        <img
          src={quest.imageUrl || null}
          alt={quest.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {quest.isQuestOfTheMonth && (
             <span className="px-3 py-1 bg-yellow-500/90 backdrop-blur-md border border-yellow-400 text-black text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center gap-1">
               <Crown size={12} /> QUEST OF THE MONTH
             </span>
          )}
          {quest.isNew && !quest.isQuestOfTheMonth && (
             <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md border border-blue-500/50 text-white text-xs font-bold rounded-lg shadow-lg">NEW</span>
          )}
          {quest.isPopular !== false && !quest.isQuestOfTheMonth && (
             <span className="px-3 py-1 bg-rose-600/90 backdrop-blur-md border border-rose-500/50 text-white text-xs font-bold rounded-lg shadow-lg">HOT</span>
          )}
        </div>

        <button 
          onClick={handleFavoriteClick} 
          className={`absolute top-4 right-4 z-20 p-2 text-white rounded-full backdrop-blur-md transition-colors border border-white/10 ${isFavorite ? 'bg-rose-500 border-rose-500 box-shadow-[0_0_15px_#f43f5e]' : 'bg-black/50 hover:bg-white/10 text-gray-300 hover:text-rose-500'}`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow z-20 relative bg-transparent">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-1 text-yellow-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">
            <Star size={14} className="fill-current" />
            <span className="text-sm font-bold text-white">{quest.rating || "5.0"}</span>
            <span className="text-xs text-gray-500">({quest.reviewsCount || 0})</span>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-white/10 border border-white/10 rounded-md text-gray-300 uppercase tracking-wider">
            {quest.ageLimit || 12}+
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-purple-400 transition-colors line-clamp-1 drop-shadow-sm flex items-center gap-2">
          {quest.title}
          {quest.isVerified && <ShieldCheck size={18} className="text-blue-400 flex-shrink-0" title="Verified Partner" />}
        </h3>

        <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow font-medium leading-relaxed">
          {quest.shortDescription || quest.fullDescription}
        </p>

        {/* Specs */}
        <div className="flex items-center space-x-4 mb-5 text-xs font-semibold text-gray-400">
          <div className="flex items-center bg-white/5 py-1 px-2 rounded border border-white/5">
            <Users size={14} className="mr-1.5 text-purple-400" />
            {quest.playersMin}-{quest.playersMax}
          </div>
          <div className="flex items-center bg-white/5 py-1 px-2 rounded border border-white/5">
            <Ghost size={14} className="mr-1.5 text-purple-400" />
            {quest.difficulty || "Medium"}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t("home.from") || "From"}</span>
            <span className="text-lg font-black text-white drop-shadow-md">
              {quest.currency || "₾"}{quest.priceFrom || quest.priceAmount || 100}
            </span>
          </div>
          <button
            onClick={handleBookNowClick}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] ${quest.isQuestOfTheMonth ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black border-transparent' : 'bg-purple-600/20 hover:bg-purple-600 border border-purple-500/50 hover:border-purple-500'}`}
          >
            {t("home.book_now") || "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
