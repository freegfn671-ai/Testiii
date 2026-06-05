import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import QuestCard from "../components/QuestCard.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import { Play } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const { t } = useTranslation();
  const { publicQuests, loading } = useQuests();
  
  // Get popular quests
  const activeQuests = publicQuests || [];
  let popularQuests = activeQuests.filter((q) => q.isPopular === true);
  if (popularQuests.length < 4) {
    const others = activeQuests.filter(q => q.isPopular !== true);
    popularQuests = [...popularQuests, ...others].slice(0, 4);
  } else {
    popularQuests = popularQuests.slice(0, 4);
  }

  return (
    <div className="flex flex-col w-full relative z-0">
      {/* Hero Section */}
      <section className="relative h-[650px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/80 via-[#070709]/60 to-[#070709] pointer-events-none" />

        <div className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center space-y-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
            {t("hero.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto drop-shadow-md">
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/quests"
              className="inline-flex items-center justify-center px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full text-lg transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(139,92,246,0.3)] relative z-30"
            >
              {t("hero.cta")}
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-lg transition-all backdrop-blur-md relative z-30"
            >
              Explore Map
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="pt-12 flex flex-wrap justify-center gap-4 relative z-30 pointer-events-auto">
            <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 cursor-pointer backdrop-blur-md transition-colors">
              {t("hero.horror")}
            </span>
            <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 cursor-pointer backdrop-blur-md transition-colors">
              {t("hero.actors")}
            </span>
            <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 cursor-pointer backdrop-blur-md transition-colors">
              {t("hero.detective")}
            </span>
            <span className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 cursor-pointer backdrop-blur-md transition-colors">
              {t("hero.kids")}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Quest of the Month Spotlight */}
      {activeQuests.find(q => q.isQuestOfTheMonth) && (() => {
        const qotm = activeQuests.find(q => q.isQuestOfTheMonth);
        const refLink = `/${i18n.language}/quest/${qotm.slug || qotm.title.toLowerCase().replace(/ /g, "-")}`;
        return (
          <section className="relative w-full overflow-hidden border-y border-yellow-500/20 bg-[#1a0b2e]/80 py-16 md:py-24 z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-yellow-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 text-left">
                <div className="inline-flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest mb-6 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  <Star size={16} className="fill-yellow-500" /> 
                  <span>QUEST OF THE MONTH</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">{qotm.title}</h2>
                <p className="text-lg md:text-xl text-gray-300 font-medium mb-8 leading-relaxed max-w-lg">{qotm.shortDescription || qotm.fullDescription}</p>
                <div className="flex items-center gap-4">
                  <Link to={refLink} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105">
                    View Experience
                  </Link>
                  <div className="flex items-center space-x-1 text-white bg-black/40 px-4 py-3.5 rounded-xl border border-white/10 backdrop-blur-md font-bold">
                    <Star size={20} className="text-yellow-500 fill-yellow-500"/> <span>{qotm.rating || "5.0"} Community Score</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <Link to={refLink} className="block relative group overflow-hidden rounded-2xl aspect-video border-2 border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src={qotm.imageUrl || null} alt={qotm.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="w-20 h-20 bg-yellow-500/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.6)] transform group-hover:scale-110 transition-transform">
                      <Play size={32} className="text-black ml-2" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Popular Quests */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {t("home.popular")}
          </h2>
          <Link
            to="/quests"
            className="hidden md:flex text-purple-400 hover:text-purple-300 font-semibold transition-colors relative z-30"
          >
            See all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularQuests.map((quest) => (
              <QuestCard key={quest.id || quest.slug} quest={quest} />
            ))}
          </div>
        )}
      </section>

      {/* Categories (Visual block) */}
      <section className="py-20 flex-1 px-8 relative z-20">
        <div className="px-6 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-10">
            {t("home.categories")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Horror", "Family", "Actors", "Sci-Fi"].map((cat, i) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={i}
                className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer z-30 pointer-events-auto"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-purple-${500 + i * 100}/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-md pointer-events-none`}
                />
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <span className="text-2xl font-bold text-white tracking-wide">
                    {cat}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Reviews Placeholder */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-10">
          {t("home.reviews")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReviewCard
            username="Alex G."
            rank="Enthusiast"
            text="Astral Tbilisi is incredibly immersive. The actors played their roles perfectly, and the jump scares were absolutely on point."
            questName="Astral Tbilisi"
            rating={5}
            date="2 days ago"
          />
          <ReviewCard
            username="Tako M."
            rank="Beginner"
            text="We went to the Detective Case. Really enjoyed the logical puzzles. Not scary, but very challenging!"
            questName="Detective Case"
            rating={4}
            date="1 week ago"
          />
          <ReviewCard
            username="Giorgi T."
            rank="Guru"
            text="The Collector feels so real. High tension from start to finish. Highly recommend for horror fans."
            questName="The Collector"
            rating={5}
            date="2 weeks ago"
          />
        </div>
      </section>
    </div>
  );
}
