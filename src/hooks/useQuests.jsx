import React, { createContext, useContext, useState, useEffect } from "react";
import { DEMO_QUESTS } from "../data/demoQuests";

const QuestContext = createContext();

export function QuestProvider({ children }) {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optimistic updates
  const addOptimisticQuest = (newQuest) => {
    setQuests(prev => [{ ...newQuest, optimistic: true }, ...prev]);
  };

  const updateOptimisticQuest = (id, updatedFields) => {
    setQuests(prev => prev.map(q => String(q.id) === String(id) || q.optimistic && q.slug === id ? { ...q, ...updatedFields } : q));
  };
  
  const refetchQuests = async () => {
    try {
      const res = await fetch("/api/quests");
      if (!res.ok) throw new Error("Failed to fetch quests");
      const fetchedQuests = await res.json();
      
      const serverSlugs = new Set(fetchedQuests.map(q => q.slug));
      const mergedDEMO = DEMO_QUESTS.filter(q => !serverSlugs.has(q.slug));
      
      setQuests([...fetchedQuests, ...mergedDEMO]);
    } catch (e) {
      console.error("Local API fetch error, falling back to DEMO", e);
      setQuests(DEMO_QUESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchQuests();
    // Poll every 10 seconds to keep fresh
    const interval = setInterval(refetchQuests, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QuestContext.Provider value={{ quests, publicQuests: quests.filter(q => q.isActive !== false), loading, addOptimisticQuest, updateOptimisticQuest, refetchQuests }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  return useContext(QuestContext);
}

