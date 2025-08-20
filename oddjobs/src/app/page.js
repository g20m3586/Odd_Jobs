"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Search, Sparkles, Filter, MapPin, DollarSign, Clock, ChevronLeft, ChevronRight,
  ShieldCheck, BadgeCheck, Rocket, Diamond, Cpu, Palette, Zap, Globe } from "lucide-react"


const avatars = [
  "https://api.dicebear.com/8.x/avataaars/svg?seed=c91d61f2-3fe6-4625-b00b-e3c68619466a",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=8d71f909-f51b-402d-abee-f05b68b371ca",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=58ab04f5-46b8-4283-97a3-6dfa3283c7c1",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=fbedca81-db33-4bcf-acf6-a26c5bc73209",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=0e74be01-cee8-40db-86a6-cfe9061d1b30",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=e64b1911-bffc-4d79-b248-b73ad20475c2",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=732a6552-e9f0-4c5b-992e-66363ec7877d",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=ccf05b74-2439-4496-b1de-e594d623e784",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=7a9370e0-f9d7-4e40-a8aa-7f1025668e79",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=a492e554-d389-43e8-9ecf-ee982780392d",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=3586bb74-31a6-4c6a-930a-11bea2c91c3d",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=3f10062c-31fa-4058-aa90-99c15b76c01c"
]
  const services = [
    "Web Development", 
    "Logo Design", 
    "Social Media", 
    "Content Writing",
    "Translation", 
    "Virtual Assistance", 
    "Voice Over", 
    "SEO"
  ];
  

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/jobs?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white pb-16 md:pb-0">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] overflow-hidden">
        {/* Fullscreen Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster="/images/video-poster.jpg"
        >
          <source src="/videos/OddJobs_Video.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Foreground Content */}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold max-w-4xl leading-tight">
            Hire smarter. Work faster.
            <br />
            <span className="text-emerald-400">
              ODDJobs connects freelancers and clients seamlessly.
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/80 max-w-2xl mt-4 md:mt-6">
            A modern freelance marketplace to find and offer high-quality services in minutes.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl mt-6 md:mt-10 relative group">
            <div className="relative flex items-center">
              <div className="absolute left-3 md:left-4 text-white/60">
                <Search className="w-4 h-4 md:w-5 md:h-5 group-focus-within:scale-110 transition-transform" />
              </div>
              <input
                type="text"
                placeholder="Find jobs, services, or freelancers..."
                className="w-full py-3 md:py-4 pl-10 md:pl-12 pr-28 md:pr-32 rounded-full bg-white/90 text-black text-sm md:text-lg border border-white/30 shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-1 h-10 md:h-12 px-4 md:px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
              >
                Search
              </Button>
            </div>

            {query && (
              <div className="absolute top-full mt-2 w-full bg-white text-black rounded-lg shadow-lg z-30 border max-h-60 overflow-y-auto">
                <div className="p-2 hover:bg-zinc-100 cursor-pointer">Web Designer in New York</div>
                <div className="p-2 hover:bg-zinc-100 cursor-pointer">Mobile App Developer</div>
                <div className="p-2 hover:bg-zinc-100 cursor-pointer">Content Writer ($50-$100)</div>
                <div className="p-2 text-sm text-zinc-500">Press Enter to search &quot;{query}&quot;</div>
              </div>
            )}

            <div className="mt-2 text-xs md:text-sm text-white/70">
              Try: <span className="text-emerald-400 hover:underline cursor-pointer">Web Design</span>{' '}
              <span className="text-emerald-400 hover:underline cursor-pointer">Copywriting</span>{' '}
              <span className="text-emerald-400 hover:underline cursor-pointer">Mobile App</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" className="rounded-full border-white/40 text-black hover:bg-white/10 hover:text-emerald-400 text-xs">
                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Category
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-white/40 text-black hover:bg-white/10 hover:text-emerald-400 text-xs">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Location
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-white/40 text-black hover:bg-white/10 hover:text-emerald-400 text-xs">
                <DollarSign className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Budget
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-white/40 text-black hover:bg-white/10 hover:text-emerald-400 text-xs">
                <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Delivery Time
              </Button>
            </div>
          </form>
        </div>
      </section>


      {/* Services */}
<section className="py-12 md:py-16 container mx-auto px-4">
  <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">
    Top Freelance Services
    <span className="block w-16 md:w-20 h-1 bg-emerald-500 mx-auto mt-3 md:mt-4"></span>
  </h2>
  
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-4">
    {services.map((service, i) => (
      <Link
        key={i}
        href={`/jobs?search=${encodeURIComponent(service)}`}
        className="p-4 md:p-6 border rounded-xl text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 group"
      >
        <div className="relative">
          <Sparkles className="mx-auto text-emerald-500 mb-2 md:mb-4 group-hover:scale-110 transition-transform w-5 h-5 md:w-6 md:h-6" />
          <h3 className="font-semibold text-sm md:text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {service}
          </h3>
        </div>
      </Link>
    ))}
  </div>
</section>

      {/* Value Propositions */}
<section className="py-12 md:py-20 px-4">
  <div className="container mx-auto max-w-6xl">
    <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-white dark:from-emerald-900/80 dark:via-teal-900/60 dark:to-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-emerald-200/50 dark:border-emerald-800/30">
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 p-6 md:p-10 lg:p-14">
        {/* Left Column - Core Value Propositions */}
        <div className="space-y-5 md:space-y-7">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-900 dark:text-emerald-50">
            The Smart Way to Build Your Team
          </h2>
          <p className="text-base md:text-lg text-emerald-800/90 dark:text-emerald-100/90">
            ODDJobs connects you with top-tier freelance talent in minutes, not weeks. Get quality work delivered faster without the overhead.
          </p>
          
          <ul className="space-y-4 md:space-y-5">
            <li className="flex items-start gap-3 md:gap-4">
              <div className="bg-emerald-500/10 p-1.5 md:p-2 rounded-full mt-0.5">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-900 dark:text-white text-sm md:text-base">Zero Platform Fees</h4>
                <p className="text-emerald-700/80 dark:text-emerald-200/80 text-xs md:text-sm mt-1">
                  Keep 100% of your budget - we do not take any commission
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <div className="bg-emerald-500/10 p-1.5 md:p-2 rounded-full mt-0.5">
                <ShieldCheck className="text-emerald-600 dark:text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-900 dark:text-white text-sm md:text-base">Risk-Free Payments</h4>
                <p className="text-emerald-700/80 dark:text-emerald-200/80 text-xs md:text-sm mt-1">
                  Funds held securely in escrow until you approve the work
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <div className="bg-emerald-500/10 p-1.5 md:p-2 rounded-full mt-0.5">
                <BadgeCheck className="text-emerald-600 dark:text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-900 dark:text-white text-sm md:text-base">Vetted Professionals</h4>
                <p className="text-emerald-700/80 dark:text-emerald-200/80 text-xs md:text-sm mt-1">
                  Only top 20% of applicants pass our rigorous screening
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Column - Social Proof */}
        <div className="space-y-5 md:space-y-7">
          <h3 className="text-xl md:text-2xl font-semibold text-emerald-900 dark:text-emerald-50">
            Trusted by innovative companies worldwide
          </h3>
          <p className="text-base md:text-lg text-emerald-800/90 dark:text-emerald-100/90">
            From fast-growing startups to established brands, we help teams scale smarter with on-demand talent.
          </p>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              { name: "StartupX", logo: <Rocket className="w-4 h-4 md:w-5 md:h-5" /> },
              { name: "BrandHouse", logo: <Diamond className="w-4 h-4 md:w-5 md:h-5" /> },
              { name: "TechNova", logo: <Cpu className="w-4 h-4 md:w-5 md:h-5" /> },
              { name: "CreativeLab", logo: <Palette className="w-4 h-4 md:w-5 md:h-5" /> },
            ].map((company, i) => (
              <div 
                key={i} 
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 bg-white/90 dark:bg-emerald-900/70 backdrop-blur-sm rounded-xl text-emerald-900 dark:text-emerald-100 border border-emerald-200/70 dark:border-emerald-700/40 shadow-sm hover:shadow-md transition-shadow text-xs md:text-sm"
              >
                <span className="text-emerald-600 dark:text-emerald-300">
                  {company.logo}
                </span>
                <span>{company.name}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 md:pt-4">
            <div className="flex items-center gap-3 p-3 md:p-4 bg-white/80 dark:bg-zinc-800/50 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 border-2 border-white dark:border-zinc-800" />
                ))}
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-emerald-900 dark:text-white">
                  142+ projects completed this week
                </p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Join thousands of satisfied clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* New Amber/Orange Complementary Section */}
<section className="py-12 md:py-20 px-4">
  <div className="container mx-auto max-w-6xl">
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-white dark:from-amber-900/80 dark:via-orange-900/60 dark:to-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-amber-200/50 dark:border-amber-800/30">
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 p-6 md:p-10 lg:p-14">
        {/* Left Column - Core Value Propositions */}
        <div className="space-y-5 md:space-y-7">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-amber-900 dark:text-amber-50">
            Lightning-Fast Project Turnaround
          </h2>
          <p className="text-base md:text-lg text-amber-800/90 dark:text-amber-100/90">
            Our freelancers deliver exceptional quality at startup speed. Go from idea to execution in record time.
          </p>
          
          <ul className="space-y-4 md:space-y-5">
            <li className="flex items-start gap-3 md:gap-4">
              <div className="bg-amber-500/10 p-1.5 md:p-2 rounded-full mt-0.5">
                <Zap className="text-amber-600 dark:text-amber-400 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-white text-sm md:text-base">24-Hour Matching</h4>
                <p className="text-amber-700/80 dark:text-amber-200/80 text-xs md:text-sm mt-1">
                  Get matched with perfect freelancers within one business day
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <div className="bg-amber-500/10 p-1.5 md:p-2 rounded-full mt-0.5">
                <Clock className="text-amber-600 dark:text-amber-400 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-white text-sm md:text-base">Average 3-Day Start</h4>
                <p className="text-amber-700/80 dark:text-amber-200/80 text-xs md:text-sm mt-1">
                  Most projects begin within 72 hours of posting
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 md:gap-4">
              <div className="bg-amber-500/10 p-1.5 md:p-2 rounded-full mt-0.5">
                <Globe className="text-amber-600 dark:text-amber-400 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-white text-sm md:text-base">Global Talent Pool</h4>
                <p className="text-amber-700/80 dark:text-amber-200/80 text-xs md:text-sm mt-1">
                  Around-the-clock coverage across all timezones
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Column - Social Proof */}
        <div className="space-y-5 md:space-y-7">
          <h3 className="text-xl md:text-2xl font-semibold text-amber-900 dark:text-amber-50">
            Speed without compromise
          </h3>
          <p className="text-base md:text-lg text-amber-800/90 dark:text-amber-100/90">
            These teams trusted us to deliver quality results on tight deadlines:
          </p>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              { name: "FlashApp", logo: <Zap className="w-4 h-4 md:w-5 md:h-5" /> },
              { name: "QuickScale", logo: <Rocket className="w-4 h-4 md:w-5 md:h-5" /> },
              { name: "DeadlinePros", logo: <Clock className="w-4 h-4 md:w-5 md:h-5" /> },
              { name: "GlobalTeams", logo: <Globe className="w-4 h-4 md:w-5 md:h-5" /> },
            ].map((company, i) => (
              <div 
                key={i} 
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 bg-white/90 dark:bg-amber-900/70 backdrop-blur-sm rounded-xl text-amber-900 dark:text-amber-100 border border-amber-200/70 dark:border-amber-700/40 shadow-sm hover:shadow-md transition-shadow text-xs md:text-sm"
              >
                <span className="text-amber-600 dark:text-amber-300">
                  {company.logo}
                </span>
                <span>{company.name}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 md:pt-4">
            <div className="flex items-center gap-3 p-3 md:p-4 bg-white/80 dark:bg-zinc-800/50 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-100 dark:bg-amber-800 border-2 border-white dark:border-zinc-800" />
                ))}
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-amber-900 dark:text-white">
                  89% of projects delivered ahead of schedule
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                  Based on last quarter&apos;s performance data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Pricing */}
      <section className="py-12 md:py-20 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">Simple, transparent pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {[ 
            { 
              title: "Free", 
              price: "$0", 
              description: "Perfect for individuals getting started",
              features: ["Browse jobs", "Apply to listings", "Build your profile"],
              cta: "Get Started"
            },
            { 
              title: "Pro", 
              price: "$12/mo", 
              description: "For serious freelancers",
              features: ["Priority listings", "Advanced filters", "Analytics dashboard", "3 featured jobs/month"],
              cta: "Go Pro",
              popular: true
            },
            { 
              title: "Business", 
              price: "$29/mo", 
              description: "For teams and agencies",
              features: ["Team hiring tools", "Direct freelancer invites", "Dedicated support", "10 featured jobs/month"],
              cta: "Contact Sales"
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`border rounded-xl p-6 md:p-8 shadow-sm hover:shadow-lg transition relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-4 md:right-6 -translate-y-1/2 bg-primary text-white text-xs font-bold px-2 md:px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className="text-lg md:text-xl font-bold mb-2">{plan.title}</h3>
              <p className="text-2xl md:text-3xl font-extrabold mb-1">{plan.price}</p>
              <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">{plan.description}</p>
              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm md:text-base">
                    <CheckCircle2 className="text-green-500 w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full text-sm md:text-base"
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="bg-zinc-100 dark:bg-zinc-800/50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-center">Meet our top freelancers</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {avatars.map((src, i) => (
              <Link 
                key={i} 
                href={`/freelancers/${i+1}`}
                className="text-center space-y-2 group"
              >
                <div className="relative mx-auto w-14 h-14 md:w-20 md:h-20">
                  <img
                    src={src}
                    alt={`Freelancer ${i + 1}`}
                    className="w-full h-full rounded-full border-2 border-primary group-hover:border-secondary transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 md:w-5 md:h-5 border-2 border-white dark:border-zinc-800"></div>
                </div>
                <p className="font-medium text-xs md:text-sm group-hover:text-primary transition-colors">Freelancer {i + 1}</p>
                <p className="text-xs text-muted-foreground">Top-rated</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">What people are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {[
            {
              quote: "ODDJobs helped me find a web developer in under 10 minutes. Incredible!",
              name: "Lebo M.",
              title: "Startup Founder",
              rating: 5
            }, 
            {
              quote: "I earn consistently through this platform. Clients trust me here.",
              name: "Nate S.",
              title: "Freelance Designer",
              rating: 5
            }, 
            {
              quote: "The hiring process is so easy — we use it every month.",
              name: "Jess T.",
              title: "Operations Lead",
              rating: 4
            }
          ].map((t, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-lg shadow border hover:shadow-lg transition">
              <div className="flex mb-3 md:mb-4">
                {[...Array(5)].map((_, star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 md:w-5 md:h-5 ${star < t.rating ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="italic mb-3 md:mb-4 text-sm md:text-lg">{`"${t.quote}"`}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:text-base">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{t.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12 md:py-20 text-center">
        <div className="container px-4 mx-auto space-y-4 md:space-y-6 max-w-4xl">
          <h2 className="text-2xl md:text-4xl font-extrabold">Ready to start?</h2>
          <p className="text-base md:text-xl">Create your profile or post your first job — it only takes a minute.</p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4 md:mt-6">
            <Button asChild size="lg" className="bg-white text-primary font-semibold hover:scale-105 transition-transform text-sm md:text-base">
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10 hover:scale-105 transition-transform text-sm md:text-base">
              <Link href="/demo">See Demo</Link>
            </Button>
          </div>
          <p className="text-xs md:text-sm text-white/80 mt-3 md:mt-4">No credit card required · 7-day free trial</p>
        </div>
      </section>
    </main>
  )
}