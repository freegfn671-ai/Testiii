import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useQuests } from "../../hooks/useQuests";

const steps = ["Basic Info", "Details", "Media", "Pricing", "Features"];

export default function QuestForm({ initialData = null, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const { addOptimisticQuest, updateOptimisticQuest } = useQuests();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: "", slug: "", city: "", district: "", address: "", company: "",
      shortDescription: "", fullDescription: "", category: "Horror", tags: "",
      difficulty: "Medium", fearLevel: "Medium", duration: 60,
      playersMin: 2, playersMax: 6, ageLimit: 14,
      priceAmount: 100, priceType: "per_team", currency: "GEL",
      imageUrl: "", images: "",
      withActors: true, wifi: false, parking: false, birthdayArea: false,
      isActive: true, isPopular: false, isNew: true, isVerified: false, isQuestOfTheMonth: false,
      lat: 41.7151, lng: 44.8271
    }
  });
  
  const priceType = watch("priceType");

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("Saving started...", data);
    const loadingToastId = toast.loading(t("admin.saving", "Saving..."));
    
    try {
      const payload = {
        ...data,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags,
        images: typeof data.images === 'string' ? data.images.split(',').map(u => u.trim()) : data.images,
        priceAmount: Number(data.priceAmount) || 0,
        priceFrom: Number(data.priceAmount) || 0, // for backward compatibility
        pricePerTeam: data.priceType === "per_team", // backward compatibility
        playersMin: Number(data.playersMin) || 1,
        playersMax: Number(data.playersMax) || 1,
        duration: Number(data.duration) || 60,
        ageLimit: Number(data.ageLimit) || 0,
        rating: initialData?.rating || 5.0, 
        reviewsCount: initialData?.reviewsCount || 0,
      };

      const token = localStorage.getItem("token");
      let res;
      if (initialData?.id) {
        res = await fetch(`/api/quests/${initialData.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/quests", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Failed to save to SQL DB");
      const savedData = await res.json();
      
      // Update optimistic state
      if (initialData?.id) {
        updateOptimisticQuest(initialData.id, payload);
      } else {
         addOptimisticQuest({ id: savedData.id, ...payload });
      }

      toast.success(t("admin.questSaved", "Quest saved successfully"), { id: loadingToastId });
      onSuccess();
    } catch (error) {
      console.error("Error saving quest to SQL:", error);
      toast.error(t("admin.questSaveFailed", "Failed to create quest in DB"), { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationError = (err) => {
    console.log("Validation errors:", err);
    toast.error(t("admin.validationError", "Please fill in all required fields."));
  };

  const BasicInfoStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input {...register("title", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
          {errors.title && <span className="text-red-500 text-xs text-left w-full mt-1">Title is required</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Slug (URL friendly)</label>
          <input {...register("slug", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
          <input {...register("city", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">District</label>
          <input {...register("district", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
          <input {...register("address", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Latitude</label>
          <input type="number" step="any" {...register("lat")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Longitude</label>
          <input type="number" step="any" {...register("lng")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
        </div>
      </div>
    </motion.div>
  );

  const DetailsStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Short Description</label>
        <textarea {...register("shortDescription", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Full Description</label>
        <textarea {...register("fullDescription", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-32" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
          <select {...register("category", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
            <option value="Horror">Horror</option><option value="Sci-Fi">Sci-Fi</option><option value="Detective">Detective</option><option value="Action">Action</option><option value="Kids">Kids</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label><select {...register("difficulty")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Fear Level</label><select {...register("fearLevel")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"><option value="None">None</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Maximum">Maximum</option></select></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label><input {...register("tags")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
    </motion.div>
  );

  const MediaStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Cover Image URL</label><input {...register("imageUrl", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Gallery Image URLs (comma separated)</label><textarea {...register("images")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-32" /></div>
    </motion.div>
  );

  const PricingStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      
      <div className="bg-black/30 border border-white/10 p-6 rounded-xl mb-6">
        <label className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Price Type</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer ${priceType === "per_person" ? "border-purple-500 bg-purple-600/20 text-purple-100" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            <input type="radio" value="per_person" {...register("priceType")} className="hidden" />
            <span className="font-bold">{t("admin.pricePerPerson", "Price per person")}</span>
          </label>
          <label className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer ${priceType === "per_team" ? "border-purple-500 bg-purple-600/20 text-purple-100" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            <input type="radio" value="per_team" {...register("priceType")} className="hidden" />
            <span className="font-bold">{t("admin.pricePerTeam", "Price per team")}</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Base Price Amount</label><input type="number" {...register("priceAmount", { required: true, valueAsNumber: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Currency</label><input defaultValue="GEL" {...register("currency")} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none opacity-50" readOnly /></div>
        
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Min Players</label><input type="number" {...register("playersMin", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Max Players</label><input type="number" {...register("playersMax", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
        
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Duration (min)</label><input type="number" {...register("duration", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Min Age Limit</label><input type="number" {...register("ageLimit", { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div>
      </div>

      <div className="p-4 mt-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-center">
        <span className="text-gray-400 text-sm">Example preview:</span>
        <div className="text-xl font-bold text-white mt-1">
          {priceType === "per_person" ? `From ${watch("priceAmount") || 0} GEL per person` : `From ${watch("priceAmount") || 0} GEL per team`}
        </div>
      </div>
    </motion.div>
  );

  const FeaturesStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {['withActors', 'wifi', 'parking', 'birthdayArea', 'isActive', 'isPopular', 'isNew', 'isVerified', 'isQuestOfTheMonth'].map(feat => (
          <div key={feat} className={`flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-lg ${feat === 'isQuestOfTheMonth' ? 'border-yellow-500/50 bg-yellow-500/10' : ''} ${feat === 'isVerified' ? 'border-blue-500/50 bg-blue-500/10' : ''}`}>
            <input type="checkbox" id={feat} {...register(feat)} className={`w-5 h-5 ${feat === 'isQuestOfTheMonth' ? 'accent-yellow-500' : feat === 'isVerified' ? 'accent-blue-500' : 'accent-purple-500'}`} />
            <label htmlFor={feat} className={`text-white capitalize ${feat === 'isQuestOfTheMonth' ? 'text-yellow-500 font-bold' : ''}`}>{feat.replace(/([A-Z])/g, ' $1').trim()}</label>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#070709]/80 border border-white/10 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl relative z-20">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">{initialData ? "Edit Quest" : "Create New Quest"}</h2>
        <div className="flex space-x-2 text-sm">
          {steps.map((s, i) => (
            <div key={s} className={`px-3 py-1 rounded-full font-medium ${i === currentStep ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : i < currentStep ? 'bg-white/10 text-gray-300' : 'bg-transparent text-gray-600 border border-white/5'}`}>{s}</div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, handleValidationError)}>
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && <BasicInfoStep key="step0" />}
            {currentStep === 1 && <DetailsStep key="step1" />}
            {currentStep === 2 && <MediaStep key="step2" />}
            {currentStep === 3 && <PricingStep key="step3" />}
            {currentStep === 4 && <FeaturesStep key="step4" />}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <div>
             <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-transparent border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
          </div>
          <div className="flex space-x-3">
            {currentStep > 0 && <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors cursor-pointer">Back</button>}
            {currentStep < steps.length - 1 ? 
              <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer">Next</button> :
              <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-white hover:bg-gray-200 text-black font-black rounded-xl transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {isSubmitting ? <span className="animate-pulse">{t("admin.saving", "Saving...")}</span> : <><Save size={18} /> <span>{t("admin.save", "Save Quest")}</span></>}
              </button>
            }
          </div>
        </div>
      </form>
    </div>
  );
}
