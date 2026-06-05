import React, { useState } from "react";
import { motion } from "motion/react";
import { format, addDays } from "date-fns";

export default function BookingCalendar({ quest, onSelectSlot }) {
  const [selectedDate, setSelectedDate] = useState(0);

  // Generate 7 days
  const upcomingDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  // Demo slots per day
  const timeSlots = ["11:20", "13:00", "14:40", "16:20", "18:00", "19:40", "21:20"];

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-2 hidden-scrollbar">
        {upcomingDays.map((date, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(index)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all ${
              selectedDate === index ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            <span className="text-xs uppercase font-medium">{format(date, "MMM")}</span>
            <span className="text-2xl font-black">{format(date, "dd")}</span>
            <span className="text-[10px] uppercase font-bold">{format(date, "EEE")}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {timeSlots.map((time, idx) => {
          // Simulate some unavailable slots randomly based on date index + time index
          const isUnavailable = (selectedDate + idx) % 5 === 0;
          return (
            <motion.button
              whileHover={!isUnavailable ? { scale: 1.05 } : {}}
              whileTap={!isUnavailable ? { scale: 0.95 } : {}}
              key={time}
              disabled={isUnavailable}
              onClick={() => onSelectSlot(upcomingDays[selectedDate], time)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border ${
                isUnavailable
                  ? "bg-black/40 border-white/5 opacity-50 cursor-not-allowed"
                  : "bg-white/5 border-purple-500/30 hover:border-purple-500 hover:bg-purple-600/20 text-white"
              } transition-colors`}
            >
              <span className={`text-lg font-bold ${isUnavailable ? "text-gray-600" : "text-white"}`}>{time}</span>
              <span className={`text-xs mt-1 font-medium ${isUnavailable ? "text-gray-700" : "text-purple-400"}`}>
                ₾{quest.priceFrom}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
