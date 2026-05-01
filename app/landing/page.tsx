"use client";

import React, { useState } from "react";

/* ── CONSTANTS ── */
const COLORS = {
  primary: "#5E72E4",
  dark: "#1A202C",
  lightBg: "#F8F9FE",
  grayText: "#718096",
};

/* ── REUSABLE COMPONENTS ── */

const Navbar = () => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-white/80 backdrop-blur-xl border border-gray-100 px-6 py-4 rounded-full flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-2 pl-4">
      <div className="w-8 h-8 bg-[#5E72E4] rounded-lg flex items-center justify-center text-white font-bold">FS</div>
      <span className="font-black text-xl tracking-tighter text-[#1A202C]">FinSync</span>
    </div>
    <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-[#718096]">
      <a href="#" className="text-[#1A202C] border-b-2 border-[#5E72E4] pb-1">Home</a>
      <a href="#" className="hover:text-[#5E72E4] transition">About</a>
      <a href="#" className="hover:text-[#5E72E4] transition">Services</a>
      <a href="#" className="hover:text-[#5E72E4] transition">Tools</a>
      <a href="#" className="hover:text-[#5E72E4] transition">Blog</a>
      <a href="#" className="hover:text-[#5E72E4] transition">Testimonials</a>
    </div>
    <button className="bg-[#1A202C] text-white px-7 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition">
      Get Started <span className="text-lg">→</span>
    </button>
  </nav>
);

const FeatureCard = ({ title, desc, icon, iconColor, imagePlaceholder }) => (
  <div className="bg-[#F8F9FE] p-10 rounded-[48px] border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-2xl transition-all group">
    <div className={`w-12 h-12 ${iconColor} rounded-xl mb-8 flex items-center justify-center text-white text-xl shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-[#1A202C] mb-4">{title}</h3>
    <p className="text-[#718096] leading-relaxed mb-10 text-lg">{desc}</p>
    <div className="relative h-64 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-inner flex items-end justify-center pt-6">
       <div className={`w-4/5 h-full rounded-t-2xl ${imagePlaceholder} opacity-40`} />
    </div>
  </div>
);

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center w-full text-left">
        <span className="text-lg font-bold text-[#1A202C]">{question}</span>
        <span className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center font-bold">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && <p className="mt-4 text-[#718096] leading-relaxed">{answer}</p>}
    </div>
  );
};

/* ── MAIN LANDING PAGE ── */

export default function LandingPage() {
  return (
    <div className="bg-white font-sans selection:bg-[#5E72E4] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-[1400px] mx-auto bg-white rounded-[60px] p-8 md:p-20 border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <span className="inline-block px-4 py-2 bg-[#5E72E4]/5 text-[#5E72E4] rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                Your Money. Your Control.
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-[#1A202C] leading-[0.9] tracking-tighter mb-8">
                Take Control of Your <br />
                <span className="text-[#5E72E4]">Financial Future</span>
              </h1>
              <p className="text-xl text-[#718096] max-w-lg mb-12 font-medium leading-relaxed">
                Take control of your money with FinSync. Track your spending, save smartly all in one easy-to-use app.
              </p>
              <div className="flex flex-wrap gap-5 mb-16">
                <button className="bg-[#5E72E4] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:shadow-2xl hover:shadow-[#5E72E4]/40 transition-all">
                  Download Apps <span className="bg-white/20 rounded-full p-1">→</span>
                </button>
                <button className="border-2 border-gray-100 px-10 py-5 rounded-2xl font-bold text-[#1A202C] hover:bg-gray-50 transition-all">
                  Explore our services
                </button>
              </div>
            </div>

            {/* Phone Mockup System */}
            <div className="relative flex justify-center items-center h-[600px]">
              <div className="absolute w-[500px] h-[500px] bg-[#5E72E4]/10 blur-[120px] rounded-full" />

              <img
                src="/"
                alt="FinSync App Screens"
                className="relative z-20 w-[340px] md:w-[420px] drop-shadow-2xl"
              />

              <div className="absolute bottom-20 -right-10 z-30 bg-white p-5 rounded-[24px] shadow-2xl border border-gray-50 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white" />
                  ))}
                </div>
                <div className="text-[10px] font-bold">500k+ Trusted Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

  
    

      {/* 2. FEATURES GRID */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
           <span className="text-[#5E72E4] font-bold text-xs bg-[#5E72E4]/5 px-4 py-2 rounded-full uppercase">Simple. Smart. Financial Control.</span>
           <h2 className="text-5xl font-black text-[#1A202C] mt-8 mb-6">Powerful Features to Take Control <br/> of Your Finances</h2>
           <p className="text-[#718096] max-w-2xl mx-auto text-lg">Manage your finances with FinSync. Monitor expenses, save efficiently all within a user-friendly app.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
           <FeatureCard title="Expense Tracking" icon="📊" iconColor="bg-[#5E72E4]" imagePlaceholder="bg-blue-100" desc="Easily track your daily, weekly, and monthly expenses to stay in control." />
           <FeatureCard title="Budget Planning" icon="📅" iconColor="bg-[#8A79F9]" imagePlaceholder="bg-purple-100" desc="Set clear budgets, monitor progress, and avoid overspending with smart tools." />
           <FeatureCard title="Multi-Account Support" icon="💳" iconColor="bg-[#1A202C]" imagePlaceholder="bg-gray-200" desc="Manage all your bank accounts in one place, track balances seamlessly." />
        </div>
        <div className="text-center mt-16">
           <button className="bg-[#5E72E4] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 mx-auto">Explore All Features →</button>
        </div>
      </section>

      {/* 3. STEPS SECTION (PURPLE BG) */}
      <section className="py-24 px-6">
        <div className="max-w-[1400px] mx-auto bg-[#8A79F9] rounded-[60px] p-12 md:p-20 text-white grid lg:grid-cols-2 gap-20 items-center">
           <div className="bg-white rounded-[40px] p-6 h-[500px] shadow-inner">
              <div className="h-full w-full bg-gray-50 rounded-3xl" />
           </div>
           <div>
              <span className="uppercase text-xs font-bold tracking-widest bg-white/10 px-4 py-2 rounded-full">How it Works</span>
              <h2 className="text-5xl font-black mt-8 mb-6 leading-tight">Manage Your Finances in <br/> 3 Simple Steps</h2>
              <div className="space-y-12 mt-12">
                 {[
                   { t: "Create Your Free Account", d: "Get started instantly and securely connect your bank accounts." },
                   { t: "See Smart Reports, Instantly", d: "Receive detailed, automated reports to help you understand your finances." },
                   { t: "Track Spending & Stay on Budget", d: "Visualize your expenses, set clear budgets, and never lose track." }
                 ].map((step, i) => (
                   <div key={i} className="flex gap-6">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-black">0{i+1}</div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{step.t}</h4>
                        <p className="text-white/70 leading-relaxed">{step.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="mt-12 bg-white text-[#8A79F9] px-10 py-5 rounded-2xl font-black">Try it for Free →</button>
           </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
           <span className="text-[#5E72E4] font-bold text-xs uppercase tracking-widest">Choose the Perfect Plan</span>
           <h2 className="text-5xl font-black text-[#1A202C] mt-4">Transparent Pricing for Everyone</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
           <div className="p-10 bg-white rounded-[48px] border border-gray-100">
              <h4 className="text-xl font-black mb-1">Basic</h4>
              <div className="text-5xl font-black mb-6">$0<span className="text-sm text-gray-400">/month</span></div>
              <button className="w-full py-4 bg-[#1A202C] text-white rounded-xl font-bold mb-8">Get Started</button>
              <ul className="space-y-4 text-sm font-medium text-[#718096]">
                 <li>✔ Connect up to 2 bank accounts</li>
                 <li>✔ Basic expense tracking</li>
                 <li>✔ Monthly reports</li>
              </ul>
           </div>
           <div className="p-10 bg-white rounded-[48px] border-4 border-[#5E72E4] relative shadow-2xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#5E72E4] text-white px-6 py-2 rounded-full text-xs font-bold">★ Most Popular</div>
              <h4 className="text-xl font-black mb-1">Pro (Recommended)</h4>
              <div className="text-5xl font-black mb-6">$19<span className="text-sm text-gray-400">/month</span></div>
              <button className="w-full py-4 bg-[#5E72E4] text-white rounded-xl font-bold mb-8">Get Started</button>
              <ul className="space-y-4 text-sm font-medium text-[#1A202C]">
                 <li>✔ Connect unlimited accounts</li>
                 <li>✔ Real-time tracking</li>
                 <li>✔ Automated insights</li>
                 <li>✔ Priority email support</li>
              </ul>
           </div>
           <div className="p-10 bg-white rounded-[48px] border border-gray-100">
              <h4 className="text-xl font-black mb-1">Business</h4>
              <div className="text-5xl font-black mb-6">$49<span className="text-sm text-gray-400">/month</span></div>
              <button className="w-full py-4 bg-[#1A202C] text-white rounded-xl font-bold mb-8">Get Started</button>
              <ul className="space-y-4 text-sm font-medium text-[#718096]">
                 <li>✔ All Pro features</li>
                 <li>✔ Multi-user access</li>
                 <li>✔ Dedicated manager</li>
              </ul>
           </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-24 bg-[#F8F9FE] px-6">
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-16">
              <span className="text-[#5E72E4] font-bold text-xs uppercase tracking-widest">FAQ</span>
              <h2 className="text-5xl font-black text-[#1A202C] mt-4">Frequently Asked Questions</h2>
           </div>
           <div className="space-y-4">
              <AccordionItem question="What services does FinSync offer?" answer="We offer a full suite of automated financial tracking, reporting, and budget management tools." />
              <AccordionItem question="How long does a typical setup take?" answer="Setting up your first bank account takes less than 2 minutes." />
              <AccordionItem question="What industries do you work with?" answer="We work with a diverse range of users from individuals to retail and tech companies." />
           </div>
        </div>
      </section>

      {/* 6. FINAL CTA & FOOTER */}
      <footer className="bg-white pt-24 pb-12 px-6">
        <div className="max-w-[1400px] mx-auto bg-[#8A79F9] rounded-[60px] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 text-white">
           <div className="flex-1">
              <h2 className="text-5xl font-black mb-6">Start Managing Your Finances <br/> with Confidence</h2>
              <div className="flex bg-white/20 p-2 rounded-2xl max-w-md">
                 <input type="text" placeholder="Enter Your Email" className="bg-transparent px-4 flex-1 outline-none placeholder:text-white" />
                 <button className="bg-white text-[#8A79F9] px-6 py-3 rounded-xl font-bold">Subscribe →</button>
              </div>
           </div>
           <div className="relative w-[300px] h-[400px] bg-dark rounded-t-[40px] border-t-8 border-x-8 border-[#1A202C]">
              <div className="w-full h-full bg-white rounded-t-3xl overflow-hidden p-4">
                 <div className="h-full bg-gray-50 rounded-xl" />
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-gray-100 pb-12">
           <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6 font-black text-2xl tracking-tighter">
                <div className="w-8 h-8 bg-[#5E72E4] rounded-lg" /> FinSync
              </div>
              <p className="text-[#718096] text-sm leading-relaxed">Your personal health companion for a healthier, organized life.</p>
           </div>
           {['Features', 'Resources', 'Company'].map(title => (
             <div key={title}>
               <h5 className="font-black text-[#1A202C] mb-6">{title}</h5>
               <ul className="space-y-4 text-sm text-[#718096]">
                 <li>Link Item One</li>
                 <li>Link Item Two</li>
                 <li>Link Item Three</li>
               </ul>
             </div>
           ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest">
           <div>©2026 TruePath UI - All Rights Reserved</div>
           <div className="flex gap-8">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
           </div>
        </div>
      </footer>
    </div>
  );
}