import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useQuests } from "../hooks/useQuests";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  LayoutDashboard,
  Calendar,
  Users,
  Star,
  BarChart3,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import QuestForm from "../components/Admin/QuestForm";
import BookingTable from "../components/Admin/BookingTable";

export default function AdminDashboard() {
  const { user, userData, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || "bookings");
  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [usersList, setUsersList] = useState([]);

  const { quests, loading: questsLoading, refetchQuests } = useQuests();

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (!authLoading && (!userData || userData.role !== "admin")) navigate("/");
  }, [userData, authLoading, navigate]);

  useEffect(() => {
    if (activeTab === "users" && userData?.role === "admin") {
      import("firebase/firestore").then(({ collection, getDocs }) => {
        import("../lib/firebase").then(({ db }) => {
           getDocs(collection(db, "users"))
             .then(snap => {
                setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
             })
             .catch(console.error);
        });
      });
    }
  }, [activeTab, userData]);

  const handleDeleteQuest = async (id) => {
    if (window.confirm("Are you sure you want to delete this quest?")) {
      try {
        const res = await fetch(`/api/quests/${id}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          refetchQuests?.();
        } else {
          console.error("Failed to delete quest");
        }
      } catch (error) {
        console.error("Error deleting quest", error);
      }
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "quests", label: "Quests", icon: Star },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const renderQuestsTab = () => {
    if (isAddingQuest || editingQuest) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <QuestForm
            initialData={editingQuest}
            onSuccess={() => {
              setIsAddingQuest(false);
              setEditingQuest(null);
            }}
            onCancel={() => {
              setIsAddingQuest(false);
              setEditingQuest(null);
            }}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl">
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search quests..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={() => setIsAddingQuest(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
          >
            <Plus size={18} /> <span>Add Quest</span>
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-sm">
                <th className="p-4 font-medium">Quest</th>
                <th className="p-4 font-medium">City</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questsLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                quests.map((q) => (
                  <motion.tr
                    key={q.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0">
                        <img
                          src={q.imageUrl || null}
                          alt={q.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {q.title}
                        </div>
                        <div className="text-xs text-gray-500">{q.slug}</div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{q.city}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${q.isActive !== false ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {q.isActive !== false ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{q.rating || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/quests/${q.slug}`)}
                          className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditingQuest(q)}
                          className="p-2 text-gray-400 hover:text-blue-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuest(q.id)}
                          className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-transparent flex flex-col md:flex-row relative z-0">
      <div className="w-full md:w-64 bg-black/40 backdrop-blur-md border-r border-white/5 p-6 flex flex-col h-auto md:min-h-screen shrink-0 z-10 relative pointer-events-auto">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-8 pb-4 border-b border-white/10">
          ADMIN PANEL
        </h2>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              activeTab === item.id && !isAddingQuest && !editingQuest;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsAddingQuest(false);
                  setEditingQuest(null);
                  navigate(`/admin/${item.id}`);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${active ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "text-gray-400 hover:bg-white/10 hover:text-white"} cursor-pointer`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-grow p-4 md:p-8 overflow-y-auto hidden-scrollbar relative z-0 pointer-events-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white capitalize">
              {isAddingQuest
                ? "Add Quest"
                : editingQuest
                  ? "Edit Quest"
                  : activeTab.replace("-", " ")}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "quests" && renderQuestsTab()}

            {activeTab === "bookings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BookingTable />
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Simplified version, you can move to a component later */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl mb-8">
                  <h3 className="text-xl font-bold mb-4 whitespace-nowrap">
                    Create Manager
                  </h3>
                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formdata = new FormData(e.target);
                      try {
                        // Dynamically import to keep it clean
                        const { doc, setDoc } = await import("firebase/firestore");
                        const { db } = await import("../lib/firebase");
                        
                        // Fake a UID for now since we don't have secondary auth setup
                        const fakeUid = "manager_" + Date.now();
                        
                        await setDoc(doc(db, "users", fakeUid), {
                          id: fakeUid,
                          name: formdata.get("name"),
                          email: formdata.get("email"),
                          company: formdata.get("company"),
                          phone: formdata.get("phone"),
                          city: formdata.get("city"),
                          role: "manager",
                          verified: true,
                          createdAt: Date.now()
                        });
                        
                        e.target.reset();
                        alert("Manager Created in Database! (Auth not implemented without admin SDK)");
                        
                        // Refresh the list
                        const { collection, getDocs } = await import("firebase/firestore");
                        const snap = await getDocs(collection(db, "users"));
                        setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                      } catch (err) {
                        alert("Error: " + err.message);
                      }
                    }}
                  >
                    <input
                      name="name"
                      placeholder="Manager Name"
                      required
                      className="bg-black/50 border border-white/10 p-3 rounded"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      className="bg-black/50 border border-white/10 p-3 rounded"
                    />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      className="bg-black/50 border border-white/10 p-3 rounded"
                    />
                    <input
                      name="company"
                      placeholder="Company Name"
                      className="bg-black/50 border border-white/10 p-3 rounded"
                    />
                    <input
                      name="phone"
                      placeholder="Phone"
                      className="bg-black/50 border border-white/10 p-3 rounded"
                    />
                    <input
                      name="city"
                      placeholder="City"
                      className="bg-black/50 border border-white/10 p-3 rounded"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 p-3 rounded text-white font-bold col-span-1 md:col-span-2 hover:bg-purple-500 transition-colors"
                    >
                      Create Manager Account
                    </button>
                  </form>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/40 border-b border-white/10 text-gray-400 text-sm">
                        <th className="p-4 font-medium">Name & Email</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Phone & City</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-semibold text-white">
                              {u.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full uppercase font-bold tracking-widest ${u.role === "admin" ? "bg-purple-500/20 text-purple-400" : u.role === "manager" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            <div>{u.phone || "-"}</div>
                            <div>{u.city || "-"}</div>
                          </td>
                          <td className="p-4 text-right">
                            {u.role !== "admin" && (
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete user?")) {
                                    import("firebase/firestore").then(({ doc, deleteDoc }) => {
                                      import("../lib/firebase").then(({ db }) => {
                                        deleteDoc(doc(db, "users", u.id)).then(() => {
                                          setUsersList(usersList.filter((user) => user.id !== u.id));
                                        });
                                      });
                                    });
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab !== "quests" &&
              activeTab !== "bookings" &&
              activeTab !== "users" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 text-center text-gray-500 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl"
                >
                  <Settings
                    size={48}
                    className="mx-auto mb-4 opacity-50 text-gray-400"
                  />
                  <p className="mb-2 text-xl font-medium text-white">
                    Module Under Construction
                  </p>
                  <p className="text-sm">
                    The {activeTab} management module is being upgraded with the
                    new UI.
                  </p>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
