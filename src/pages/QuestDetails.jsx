import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import BookingModal from "../components/BookingModal.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import BookingCalendar from "../components/Quest/BookingCalendar.jsx";
import { 
  Star, Clock, Users, ShieldAlert, Heart, Share2, MapPin, 
  Wifi, Car, Gift, Theater, ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

export default function QuestDetails() {
  const { slug } = useParams();
  const { quests, loading } = useQuests();
  const quest = quests.find((q) => q.slug === slug);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (loading) return <div className="p-20 text-center text-white"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
  if (!quest) return <div className="p-20 text-center text-2xl font-bold text-white">Quest Not Found</div>;

  const handleSlotSelect = (date, time) => {
    setSelectedSlot({ date, time });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full relative z-0">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-end pb-12 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <img src={quest.imageUrl || null} alt={quest.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-end pointer-events-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-purple-600/30 text-purple-300 border border-purple-500/50 text-xs font-bold rounded-lg uppercase tracking-wider backdrop-blur-md">
                {quest.category}
              </span>
              {quest.isQuestOfTheMonth && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold rounded-lg uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                  <Star size={12} className="fill-current" /> QOTM
                </span>
              )}
              {quest.withActors && <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-lg uppercase backdrop-blur-md">With Actors</span>}
              {quest.tags && quest.tags.map(t => (
                <span key={t} className="px-3 py-1 bg-white/10 border border-white/20 text-gray-300 text-xs font-bold rounded-lg uppercase backdrop-blur-md">{t}</span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-lg flex items-center gap-4">
              {quest.title}
              {quest.isVerified && (
                <span className="bg-blue-500/20 text-blue-400 p-2 rounded-full border border-blue-500/50 flex-shrink-0" title="Verified Partner">
                  <ShieldAlert size={28} className="fill-blue-500/20" />
                </span>
              )}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-300">
              <div className="flex items-center text-yellow-500 bg-black/40 px-3 py-1 border border-white/10 rounded-full backdrop-blur-md">
                <Star size={16} className="fill-current mr-2" />
                <span className="text-white font-bold mr-1">{quest.rating || "5.0"}</span>
                <span className="text-gray-400 font-normal">({quest.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-center bg-black/40 px-3 py-1 border border-white/10 rounded-full backdrop-blur-md">
                <MapPin size={16} className="mr-2 text-purple-400" />
                {quest.city}, {quest.district}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 mt-4 md:mt-0">
            <button className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-white backdrop-blur-md cursor-pointer"><Heart size={20} /></button>
            <button className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-white backdrop-blur-md cursor-pointer"><Share2 size={20} /></button>
            <button onClick={() => window.scrollTo({top: document.getElementById('booking').offsetTop, behavior: 'smooth'})} className="px-6 h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-500 border border-purple-500 rounded-full transition-colors text-white font-bold cursor-pointer">
              Book <ArrowRight size={18} className="ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Sticky Tabs Navigation */}
      <div className="sticky top-0 z-50 bg-[#070709]/90 backdrop-blur-xl border-b border-white/10 w-full hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-4 flex space-x-6 overflow-x-auto hidden-scrollbar">
          {["Overview", "Story", "Features", "Gallery", "Reviews", "Booking"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                const el = document.getElementById(tab.toLowerCase());
                if (el) {
                  const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className="text-sm font-bold text-gray-400 hover:text-white uppercase tracking-wider whitespace-nowrap transition-colors"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10" id="overview">
        <div className="lg:col-span-2 space-y-16">
          {/* Overview Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: Users, label: "Players", value: `${quest.playersMin}-${quest.playersMax}` },
               { icon: Clock, label: "Duration", value: `${quest.duration} min` },
               { icon: ShieldAlert, label: "Difficulty", value: quest.difficulty || "Medium" },
               { textIcon: `${quest.ageLimit}+`, label: "Age Limit", value: "Min Age", color: "text-orange-400" }
             ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                  {stat.icon ? <stat.icon size={28} className="text-purple-400 mb-3" /> : <span className={`text-3xl font-black mb-2 ${stat.color}`}>{stat.textIcon}</span>}
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{stat.label}</span>
                  <span className="font-bold text-white text-lg">{stat.value}</span>
                </div>
             ))}
          </motion.div>

          {/* Storyline */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="story">
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">The Story</h2>
            <p className="text-gray-300 text-lg leading-relaxed bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
              {quest.fullDescription}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="features">
             <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Features</h2>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Theater, label: "Actors Included", active: quest.withActors },
                  { icon: MapPin, label: "City Center", active: true },
                  { icon: Wifi, label: "Free Wi-Fi", active: quest.wifi !== false },
                  { icon: Car, label: "Parking", active: quest.parking !== false },
                  { icon: Gift, label: "Birthday Area", active: quest.birthdayArea !== false },
                ].map((feat, i) => (
                  <div key={i} className={`flex items-center space-x-3 p-4 rounded-xl border ${feat.active ? 'bg-purple-600/10 border-purple-500/20 text-purple-100' : 'bg-black/20 border-white/5 text-gray-600 opacity-50'}`}>
                    <feat.icon size={20} className={feat.active ? "text-purple-400" : "text-gray-600"}/>
                    <span className="text-sm font-medium">{feat.label}</span>
                  </div>
                ))}
             </div>
          </motion.div>

          {/* Gallery placeholder */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="gallery">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Gallery</h2>
            <div className="grid grid-cols-3 gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden relative cursor-pointer group">
                    <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                    <img src={quest.imageUrl || null} alt="Gallery" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                 </div>
               ))}
            </div>
          </motion.div>
          
          {/* Similar Quests */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="reviews">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Reviews</h2>
              <button className="text-purple-400 font-medium hover:text-purple-300">Write a Review</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReviewCard username="Alex" rank="Enthusiast" text="Amazing quest, extremely scary!" questName={quest.title} rating={5} date="3 days ago" />
              <ReviewCard username="Maria" rank="Beginner" text="Really well thought out puzzles." questName={quest.title} rating={4} date="1 week ago" />
            </div>
          </motion.div>
        </div>

        {/* Right Col: Booking System */}
        <div className="lg:col-span-1" id="booking">
          <div className="sticky top-24 bg-[#070709]/80 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl shadow-2xl relative z-20 pointer-events-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Book Online</h3>
            <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-6">
              Select date and time to reserve.
            </p>
            
            <BookingCalendar quest={quest} onSelectSlot={handleSlotSelect} />
            
            <div className="mt-8 pt-6 border-t border-white/10 text-sm text-gray-400 space-y-2">
              <p><span className="text-white font-medium">Address:</span> {quest.address}, {quest.district}</p>
              <p className="text-xs text-gray-500 pt-2">Payment is completed on-site. Free cancellation up to 2 hours before.</p>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        quest={quest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedSlot={selectedSlot}
      />
    </div>
  );
}
