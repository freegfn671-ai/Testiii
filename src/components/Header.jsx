import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../hooks/useAuthStore";
import { Menu, Search, User, X, MapPin } from "lucide-react";
import { cn } from "../utils/cn";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, userData, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-2xl border-b border-white/10">
      {/* Top bar */}
      <div className="hidden lg:flex justify-between items-center px-6 py-2 text-xs font-medium text-gray-400 bg-transparent border-b border-white/5">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 hover:text-white cursor-pointer transition-colors">
            <MapPin size={14} className="text-purple-500" />
            <span>Tbilisi</span>
          </div>
          <span>+995 555 123 456</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeLanguage("en")}
            className={cn(
              "hover:text-white transition-colors",
              i18n.language === "en" && "text-white font-bold",
            )}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("ru")}
            className={cn(
              "hover:text-white transition-colors",
              i18n.language === "ru" && "text-white font-bold",
            )}
          >
            RU
          </button>
          <button
            onClick={() => changeLanguage("ka")}
            className={cn(
              "hover:text-white transition-colors",
              i18n.language === "ka" && "text-white font-bold",
            )}
          >
            KA
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 tracking-tighter"
        >
          QUEST<span className="text-white">GEORGIA</span>
        </Link>

        <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold">
          <Link
            to="/quests"
            className="hover:text-purple-400 transition-colors"
          >
            {t("header.quests")}
          </Link>
          <Link
            to="#"
            className="text-gray-400 hover:text-purple-400 transition-colors"
          >
            {t("header.gifts")}
          </Link>
          <Link
            to="/leaderboard"
            className="text-gray-400 hover:text-purple-400 transition-colors"
          >
            {t("header.rating")}
          </Link>
          <Link
            to="/map"
            className="text-gray-400 hover:text-purple-400 transition-colors"
          >
            {t("header.map")}
          </Link>
          <Link
            to="#"
            className="text-gray-400 hover:text-purple-400 transition-colors"
          >
            {t("header.players")}
          </Link>
        </nav>

        <div className="flex items-center space-x-4 lg:space-x-6">
          <button className="text-white hover:text-purple-400 transition-colors">
            <Search size={20} />
          </button>

          <div className="hidden lg:block relative group">
            <Link
              to={user ? "/profile" : "/login"}
              className="text-white hover:text-purple-400 transition-colors flex items-center space-x-2"
            >
              <User size={20} />
            </Link>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-black/20 backdrop-blur-2xl border-b border-white/5 p-6 flex flex-col space-y-6 shadow-2xl">
          <Link
            to="/quests"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-semibold hover:text-purple-400 transition-colors"
          >
            {t("header.quests")}
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-semibold text-gray-400 hover:text-purple-400 transition-colors"
          >
            {t("header.rating")}
          </Link>
          <Link
            to="/map"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-semibold text-gray-400 hover:text-purple-400 transition-colors"
          >
            {t("header.map")}
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-semibold text-purple-400 hover:text-purple-500 transition-colors flex items-center"
          >
            <User size={20} className="mr-2" />
            {user ? "My Profile" : "Login / Register"}
          </Link>
          <div className="flex space-x-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                changeLanguage("en");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                i18n.language === "en" && "text-white font-bold",
              )}
            >
              EN
            </button>
            <button
              onClick={() => {
                changeLanguage("ru");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                i18n.language === "ru" && "text-white font-bold",
              )}
            >
              RU
            </button>
            <button
              onClick={() => {
                changeLanguage("ka");
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                i18n.language === "ka" && "text-white font-bold",
              )}
            >
              KA
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
