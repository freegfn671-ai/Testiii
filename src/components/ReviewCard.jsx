import React from "react";
import { Star, User } from "lucide-react";

export default function ReviewCard({
  username,
  rank,
  text,
  questName,
  rating,
  date,
}) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center text-purple-200">
            <User size={20} />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{username}</h4>
            <span className="text-xs text-purple-400 font-medium">{rank}</span>
          </div>
        </div>
        <div className="flex text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < rating ? "fill-current" : "text-gray-700"}
            />
          ))}
        </div>
      </div>

      <p className="text-gray-300 text-sm italic mb-4 flex-grow">"{text}"</p>

      <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs">
        <span className="text-gray-500">{date}</span>
        <span className="text-gray-400 font-medium border border-white/10 px-2 py-1 rounded bg-black/50">
          {questName}
        </span>
      </div>
    </div>
  );
}
