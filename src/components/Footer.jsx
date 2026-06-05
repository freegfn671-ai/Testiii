import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link
            to="/"
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 tracking-tighter"
          >
            QUEST<span className="text-white">GEORGIA</span>
          </Link>
          <p className="text-gray-400 text-sm">{t("footer.description")}</p>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link
                to="/quests"
                className="hover:text-purple-400 transition-colors"
              >
                {t("header.quests")}
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                {t("header.gifts")}
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                {t("header.rating")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                {t("footer.faq")}
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Organizers</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                {t("footer.add_quest")}
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="hover:text-purple-400 transition-colors"
              >
                Admin Dashboard
              </Link>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Quest Georgia. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
