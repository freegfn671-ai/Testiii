import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Trash2, Phone, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });
      fetchBookings();
    } catch (e) {
      console.error(e);
      alert("Error updating status.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this booking permanently?")) {
      try {
         await fetch(`/api/bookings/${id}`, { 
           method: "DELETE",
           headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
         });
         fetchBookings();
      } catch (error) {
         console.error(error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Bookings...</div>;

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-x-auto shadow-2xl">
      <table className="w-full text-left border-collapse min-w-[800px]">
         <thead>
           <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-sm">
             <th className="p-4 font-medium">Date & Time</th>
             <th className="p-4 font-medium">Quest</th>
             <th className="p-4 font-medium">Customer</th>
             <th className="p-4 font-medium">Details</th>
             <th className="p-4 font-medium">Status & Price</th>
             <th className="p-4 font-medium text-right">Actions</th>
           </tr>
         </thead>
         <tbody>
           {bookings.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">No bookings found.</td></tr>}
           {bookings.map((b) => (
             <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
               <td className="p-4">
                 <div className="text-white font-medium">{b.selectedDate ? format(new Date(b.selectedDate), "MMM dd, yyyy") : "N/A"}</div>
                 <div className="text-purple-400 font-bold">{b.selectedTime || "N/A"}</div>
                 <div className="text-xs text-gray-500 mt-1">Booked: {b.createdAt?.toDate ? format(b.createdAt.toDate(), "dd.MM.yy HH:mm") : '...'}</div>
               </td>
               
               <td className="p-4 font-medium text-white">{b.questId || "Unknown"}</td>
               
               <td className="p-4">
                 <div className="font-semibold text-white">{b.contactInfo?.name || "No name"}</div>
                 <div className="text-xs text-gray-400">{b.contactInfo?.phone}</div>
                 <div className="mt-1 flex gap-1">
                   {b.contactInfo?.method === "whatsapp" && <MessageCircle size={14} className="text-green-500" title="WhatsApp" />}
                   {b.contactInfo?.method === "telegram" && <MessageCircle size={14} className="text-blue-400" title="Telegram" />}
                   {b.contactInfo?.method === "phone" && <Phone size={14} className="text-gray-400" title="Phone" />}
                 </div>
               </td>

               <td className="p-4">
                 <div className="text-sm text-gray-300">{b.players} Players</div>
                 <div className={`text-xs mt-1 ${b.paymentMethod === 'online' ? 'text-green-400' : 'text-gray-400'}`}>
                   {b.paymentMethod === 'online' ? "Paid Online" : "Pay on Site"}
                 </div>
                 {b.comment && <div className="text-xs text-yellow-500 mt-1 truncate w-32" title={b.comment}>Note: {b.comment}</div>}
               </td>

               <td className="p-4">
                 <div className="text-xl font-black text-white mb-1">₾{b.totalPrice}</div>
                 <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${
                   b.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                   b.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                 }`}>
                   {b.status || 'pending'}
                 </span>
               </td>

               <td className="p-4 text-right">
                 <div className="flex justify-end gap-2">
                   {b.status !== 'confirmed' && (
                     <button onClick={() => updateStatus(b.id, 'confirmed')} className="p-2 text-gray-400 hover:text-green-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Confirm">
                       <CheckCircle size={16} />
                     </button>
                   )}
                   {b.status !== 'cancelled' && (
                     <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Cancel">
                       <XCircle size={16} />
                     </button>
                   )}
                   <button onClick={() => handleDelete(b.id)} className="p-2 text-gray-600 hover:text-red-500 bg-black/40 hover:bg-white/10 rounded-lg transition-colors ml-2" title="Delete">
                     <Trash2 size={16} />
                   </button>
                 </div>
               </td>
             </motion.tr>
           ))}
         </tbody>
      </table>
    </div>
  );
}
