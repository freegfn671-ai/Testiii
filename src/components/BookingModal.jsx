import React, { useState, useEffect } from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { X, Calendar, Clock, CreditCard, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

export default function BookingModal({ quest, isOpen, onClose, selectedSlot }) {
  const { user, userData } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", players: quest?.playersMin || 2, 
    comment: "", paymentMethod: "cash", contactMethod: "telegram"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: userData.displayName || prev.name,
        email: user?.email || prev.email,
        phone: userData.phone || prev.phone
      }));
    }
    if (isOpen) {
      setStep(1);
      // Pre-fill date and time based on selected slot if available
      setFormData(prev => ({
        ...prev,
        date: selectedSlot ? format(selectedSlot.date, "yyyy-MM-dd") : prev.date,
        time: selectedSlot ? selectedSlot.time : prev.time
      }));
    }
  }, [userData, user, isOpen, selectedSlot]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePrice = () => {
    if (!quest) return 0;
    if (quest.pricePerTeam) return quest.priceFrom;
    return quest.priceFrom * formData.players;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        questId: quest.id || quest.slug,
        questName: quest.title,
        date: selectedSlot ? selectedSlot.date.toISOString() : (formData.date ? new Date(formData.date).toISOString() : null),
        time: selectedSlot ? selectedSlot.time : formData.time,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        participants: Number(formData.players),
        totalPrice: calculatePrice(),
        status: "pending"
      };
      
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save booking");
      
      setStep(3); // Success step
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Error confirming booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {step === 3 ? "Booking Confirmed!" : `Book ${quest?.title}`}
              </h3>
              {selectedSlot && step !== 3 && (
                <p className="text-purple-400 text-sm mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {format(selectedSlot.date, "MMM dd, yyyy")}</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> {selectedSlot.time}</span>
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto hidden-scrollbar relative z-10 pointer-events-auto">
            {step === 1 && (
              <form onSubmit={() => setStep(2)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" />
                  </div>
                  
                  {!selectedSlot && (
                     <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                          <input required type="date" name="date" value={formData.date || ""} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" style={{ colorScheme: "dark" }} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                          <input required type="time" name="time" value={formData.time || ""} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors" style={{ colorScheme: "dark" }} />
                        </div>
                     </>
                  )}

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Number of Players</label>
                    <select name="players" value={formData.players} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors block">
                      {Array.from({ length: (quest?.playersMax || 10) - (quest?.playersMin || 2) + 1 }).map((_, i) => {
                        const count = (quest?.playersMin || 2) + i;
                        return <option key={count} value={count}>{count} Players</option>;
                      })}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Contact</label>
                    <select name="contactMethod" value={formData.contactMethod} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors block">
                      <option value="telegram">Telegram</option><option value="whatsapp">WhatsApp</option><option value="viber">Viber</option><option value="phone">Phone Call</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Comment (Optional)</label>
                    <textarea name="comment" value={formData.comment} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors h-24 resize-none" placeholder="Any special requests or details..." />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="button" onClick={() => setStep(2)} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    Continue
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
                  <h4 className="text-white font-medium mb-4">Select Payment Method</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === 'cash' ? 'bg-purple-600/20 border-purple-500 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                      <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleChange} className="hidden" />
                      <Banknote className="mr-3" />
                      <div><p className="font-bold">Pay on Site (Cash or Card)</p><p className="text-xs opacity-70">No prepayment required</p></div>
                    </label>
                    <label className={`flex items-center p-4 border rounded-xl cursor-not-allowed transition-colors ${formData.paymentMethod === 'online' ? 'bg-purple-600/20 border-purple-500 text-white' : 'border-white/5 bg-black/20 text-gray-600'}`}>
                      <input type="radio" name="paymentMethod" value="online" disabled className="hidden" />
                      <CreditCard className="mr-3" />
                      <div><p className="font-bold">Pay Online Now</p><p className="text-xs opacity-70">Coming soon</p></div>
                    </label>
                  </div>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl flex justify-between items-center">
                   <div className="text-gray-300">Total Price</div>
                   <div className="text-3xl font-black text-white">₾{calculatePrice()}</div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)] flex justify-center items-center">
                    {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Confirm Booking"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white">You're all set!</h3>
                <p className="text-gray-400">Your booking for <strong className="text-white">{quest?.title}</strong> is confirmed. We have sent the details to your email and will contact you via {formData.contactMethod}.</p>
                <div className="pt-6 mt-6 border-t border-white/10">
                  <button onClick={onClose} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors w-full">
                    Return to Quest
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
