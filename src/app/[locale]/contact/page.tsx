"use client";

import { useTranslations } from "@/providers/i18n.provider";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const dict = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:4000";
      const response = await fetch(`${baseUrl}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      toast.success(dict.contact.success);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(dict.contact.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.7]" 
          style={{ backgroundImage: "url('/assets/accueil.png')" }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{dict.contact.title}</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            {dict.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
            {/* Contact Info */}
            <div className="md:col-span-2 bg-accent p-8 md:p-12 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-8">LocoTrip</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{dict.common.emailAddress}</p>
                      <p className="opacity-80 text-sm">support@locotrip.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Bureaux</p>
                      <p className="opacity-80 text-sm">Rennes, France</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-white/20">
                <p className="text-sm opacity-60">
                  © {new Date().getFullYear()} LocoTrip. Tous droits réservés.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-3 p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{dict.contact.name}</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{dict.contact.email}</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{dict.contact.subject}</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none"
                  placeholder={dict.contact.subject}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{dict.contact.message}</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none resize-none"
                  placeholder={dict.contact.message}
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-accent hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                    {dict.contact.sending}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {dict.contact.send}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
