import React, { useState } from 'react';
import { Film, Shield, Phone, Mail, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does real-time seat locking work?',
      a: 'When you select seats and proceed to checkout, IMovies atomically reserves those seats for 10 minutes. If checkout is completed, the reservation is permanently finalized; otherwise, the seats are automatically restored to the available pool.'
    },
    {
      q: 'Can I cancel or exchange my tickets?',
      a: 'Booked tickets can be cancelled up to 2 hours before the scheduled showtime directly through your My Bookings dashboard.'
    },
    {
      q: 'How do I enter the cinema with digital tickets?',
      a: 'Simply present your digital ticket with the generated QR code or booking reference code at the theater check-in gate on your mobile device.'
    }
  ];

  return (
    <footer className="w-full bg-[#07080b] border-t border-[#181d2a] text-xs text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white font-['Outfit']">
                IMOVIES
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated by <span className="text-white font-bold">Harsh Ranawat</span>. The ultimate online movie ticket booking platform for IMAX 3D, Dolby Atmos, and luxury cinema halls.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Engineered with React · Node.js · Express · MongoDB
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Cinema Formats
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-red-400 transition-colors">IMAX with Laser 3D</li>
              <li className="hover:text-red-400 transition-colors">Dolby Cinema & Atmos</li>
              <li className="hover:text-red-400 transition-colors">4DX Environmental Motion</li>
              <li className="hover:text-red-400 transition-colors">VIP Recliner Lounges</li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Contact & Concierge
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-red-500" />
                <span>+91 1800 200 4668 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <span>concierge@imovies.com</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Curator Inquiries: Harsh Ranawat
              </div>
            </div>
          </div>

          {/* Col 4: FAQs dropdown preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Frequently Asked Questions
            </h4>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-[#1f2537] rounded-lg overflow-hidden bg-[#0d0f15]">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-2 text-left text-xs font-medium text-slate-300 flex items-center justify-between hover:text-white cursor-pointer"
                  >
                    <span className="line-clamp-1">{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-2 pt-0 text-[11px] text-slate-400 border-t border-[#1f2537] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-[#161a26] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} IMovies Systems. Designed & Developed by <span className="text-slate-300 font-semibold">Harsh Ranawat</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
