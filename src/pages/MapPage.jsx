import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MapPin, ChevronRight, ShieldCheck, Map as MapIcon } from "lucide-react";
import { useQuests } from "../hooks/useQuests";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "motion/react";

// Fix leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const verifiedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxMWwtNS01LTUtNXItMTF2MTV6Ii8+PC9zdmc+', // Basic fallback or could use standard pin tinted blue
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

export default function MapPage() {
  const { quests } = useQuests();
  const navigate = useNavigate();
  const [activeQuest, setActiveQuest] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Fake lat/lng for quests if not provided (demo purposes since DB doesn't have real coords yet)
  const mapCenter = [41.7151, 44.8271]; // Tbilisi
  
  const mapQuests = quests.map((q) => {
    // Generate roughly around Tbilisi if null
    const lat = q.lat || (41.7151 + (Math.random() - 0.5) * 0.1);
    const lng = q.lng || (44.8271 + (Math.random() - 0.5) * 0.1);
    return { ...q, lat, lng };
  }).filter((q) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "verified") return q.isVerified;
    if (activeFilter === "actors") return q.withActors;
    if (activeFilter === "top_rated") return q.rating >= 4.8;
    return q.category?.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] w-full overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-1/3 md:h-full overflow-y-auto bg-black/90 border-r border-white/10 z-10 custom-scrollbar flex flex-col pt-0">
        <div className="p-4 border-b border-white/10 bg-black sticky top-0 z-20">
          <h2 className="text-xl font-bold text-white flex items-center mb-4">
            <MapIcon className="mr-2" size={20} /> Quest Map
          </h2>
          
          <div className="flex overflow-x-auto gap-2 pb-2 hidden-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'verified', label: 'Verified', icon: ShieldCheck },
              { id: 'horror', label: 'Horror' },
              { id: 'detective', label: 'Detective' },
              { id: 'kids', label: 'Kids' },
              { id: 'adventure', label: 'Adventure' },
              { id: 'actors', label: 'With Actors' },
              { id: 'top_rated', label: 'Top Rated', icon: Star },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${activeFilter === f.id ? (f.id === 'verified' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-purple-600 border-purple-500 text-white') : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                {f.icon && <f.icon size={12} className="mr-1" />} {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 space-y-4 flex-1">
          {mapQuests.length === 0 && (
             <div className="text-gray-500 text-center py-10">No quests found for this filter.</div>
          )}
          {mapQuests.map((quest) => (
            <motion.div 
              key={quest.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveQuest(quest)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${activeQuest?.id === quest.id ? 'bg-purple-900/30 border-purple-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <div className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden flex-shrink-0 relative">
                <img src={quest.imageUrl || "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80"} alt={quest.title} className="w-full h-full object-cover" />
                {quest.isVerified && (
                  <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                    <ShieldCheck size={10} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{quest.title}</h4>
                <div className="text-xs text-gray-400 mt-1 flex items-center truncate">
                  <MapPin size={10} className="mr-1" /> {quest.address || quest.city}
                </div>
                <div className="text-xs font-bold text-purple-400 mt-1">{quest.priceAmount} {quest.currency}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full relative">
        <MapContainer 
          center={mapCenter} 
          zoom={12} 
          style={{ height: "100%", width: "100%" }}
          className="z-0 relative leaflet-container-dark" // custom css for dark maps
        >
          {/* Using dark basemap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {mapQuests.map((quest) => (
            <Marker 
              key={quest.id} 
              position={[quest.lat, quest.lng]} 
              icon={quest.isVerified ? verifiedIcon : customIcon}
              eventHandlers={{
                click: () => setActiveQuest(quest),
              }}
            >
              <Popup className="custom-popup">
                <div className="text-center pb-2 cursor-pointer" onClick={() => navigate(`/quests/${quest.slug}`)}>
                  <div className="w-full h-24 mb-2 rounded overflow-hidden relative">
                     <img src={quest.imageUrl || "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80"} alt={quest.title} className="w-full h-full object-cover" />
                     {quest.isVerified && (
                       <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md">
                         <ShieldCheck size={10} /> Verified
                       </div>
                     )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{quest.title}</h3>
                  <div className="flex items-center justify-center text-sm text-yellow-500 font-bold mb-2">
                    <Star size={14} className="mr-1 fill-yellow-500 text-yellow-500" /> {quest.rating}
                  </div>
                  <div className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-1.5 px-4 rounded w-full flex items-center justify-center">
                    Book Now
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Style override to make leaflet popup dark */}
        <style dangerouslySetInnerHTML={{__html: `
          .leaflet-popup-content-wrapper, .leaflet-popup-tip {
            background: #18181b;
            color: white;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .leaflet-popup-close-button {
            color: white !important;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
          }
        `}} />
      </div>
    </div>
  );
}
