import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuests } from "../hooks/useQuests";
import QuestCard from "../components/QuestCard.jsx";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

export default function QuestCatalog() {
  const { t } = useTranslation();
  const { publicQuests, quests, loading } = useQuests();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const questsToFilter = publicQuests || quests;

  const filtered = questsToFilter.filter((q) => {
    if (q.isActive === false) return false;
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" ||
      q.category === category ||
      (q.genre && q.genre.includes(category)) ||
      (q.tags && q.tags.includes(category));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-0">
      <div className="mb-10 text-center relative z-20">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          {t("header.quests")}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400">
          Find your next adventure from our handpicked selection.
        </motion.p>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 relative z-20 pointer-events-auto">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search quests..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors pointer-events-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 pointer-events-auto">
          {["All", "Horror", "Action", "Detective", "Sci-Fi", "Kids"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${category === cat ? "bg-purple-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
              >
                {cat}
              </button>
            ),
          )}
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors flex items-center cursor-pointer">
            <SlidersHorizontal size={16} className="mr-2" /> Filters
          </button>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filtered.length > 0 ? (
            filtered.map((quest, index) => (
              <motion.div key={quest.id || quest.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="h-full">
                <QuestCard quest={quest} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500">
              No quests found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
