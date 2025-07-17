"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Search, Sparkles, Filter, MapPin, DollarSign, Clock } from "lucide-react"

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

export default function HomePage() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/jobs?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <main className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      {/* Hero */}
<section className="relative h-[90vh] overflow-hidden">
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
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold max-w-4xl leading-tight">
      Hire smarter. Work faster.
      <br />
      <span>
        ODDJobs connects freelancers and clients seamlessly.
      </span>
    </h1>

    <p className="text-lg text-white/80 max-w-2xl mt-6">
      A modern freelance marketplace to find and offer high-quality services in minutes.
    </p>

    <form onSubmit={handleSearch} className="w-full max-w-2xl mt-10 relative group">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-white/60">
          <Search className="w-5 h-5 group-focus-within:scale-110 transition-transform" />
        </div>
        <input
          type="text"
          placeholder="Find jobs, services, or freelancers..."
          className="w-full py-4 pl-12 pr-32 rounded-full bg-white/90 text-black text-lg border border-white/30 shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          className="absolute right-1 h-12 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:scale-[1.02] transition-all duration-200"
        >
          Search
        </Button>
      </div>

      {query && (
        <div className="absolute top-full mt-2 w-full bg-white text-black rounded-lg shadow-lg z-30 border max-h-60 overflow-y-auto">
          <div className="p-2 hover:bg-zinc-100 cursor-pointer">Web Designer in New York</div>
          <div className="p-2 hover:bg-zinc-100 cursor-pointer">Mobile App Developer</div>
          <div className="p-2 hover:bg-zinc-100 cursor-pointer">Content Writer ($50-$100)</div>
          <div className="p-2 text-sm text-zinc-500">Press Enter to search "{query}"</div>
        </div>
      )}

      <div className="mt-2 text-sm text-white/70">
        Try: <span className="text-primary hover:underline cursor-pointer">Web Design</span>{' '}
        <span className="text-primary hover:underline cursor-pointer">Copywriting</span>{' '}
        <span className="text-primary hover:underline cursor-pointer">Mobile App</span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" className="rounded-full border-white/40 text-white hover:bg-white/10">
          <Filter className="w-4 h-4 mr-1" />
          Category
        </Button>
        <Button variant="outline" size="sm" className="rounded-full border-white/40 text-white hover:bg-white/10">
          <MapPin className="w-4 h-4 mr-1" />
          Location
        </Button>
        <Button variant="outline" size="sm" className="rounded-full border-white/40 text-white hover:bg-white/10">
          <DollarSign className="w-4 h-4 mr-1" />
          Budget
        </Button>
        <Button variant="outline" size="sm" className="rounded-full border-white/40 text-white hover:bg-white/10">
          <Clock className="w-4 h-4 mr-1" />
          Delivery Time
        </Button>
      </div>
    </form>
  </div>
</section>


      {/* Services */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Top Freelance Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {["Web Development", "Logo Design", "Social Media", "Content Writing", "Translation", "Virtual Assistance", "Voice Over", "SEO"].map((service, i) => (
            <Link
              key={i}
              href={`/jobs?search=${service}`}
              className="p-6 border rounded-lg hover:shadow-md text-center transition hover:-translate-y-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Sparkles className="mx-auto text-primary mb-4" />
              <h3 className="font-semibold">{service}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="bg-zinc-50 dark:bg-zinc-800/50 py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 text-left max-w-5xl">
          <div>
            <h2 className="text-3xl font-bold mb-4">Why choose ODDJobs?</h2>
            <p className="text-muted-foreground mb-6">
              Our platform is tailored to give businesses access to reliable, skilled freelancers in record time.
            </p>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                No commission fees.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                Secure payments with escrow.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                Verified freelancers and projects.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">ODDJobs is trusted by modern startups</h3>
            <p className="text-muted-foreground mb-6">
              Whether you're building a website or scaling your brand, we help you find the right people to get it done.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Startup A", "Company B", "Brand C", "Agency D"].map((company, i) => (
                <div key={i} className="px-4 py-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Simple, transparent pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
              className={`border rounded-xl p-8 shadow-sm hover:shadow-lg transition relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-extrabold mb-1">{plan.price}</p>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="bg-zinc-100 dark:bg-zinc-800/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Meet our top freelancers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {avatars.map((src, i) => (
              <Link 
                key={i} 
                href={`/freelancers/${i+1}`}
                className="text-center space-y-2 group"
              >
                <div className="relative mx-auto w-20 h-20">
                  <img
                    src={src}
                    alt={`Freelancer ${i + 1}`}
                    className="w-full h-full rounded-full border-2 border-primary group-hover:border-secondary transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 border-2 border-white dark:border-zinc-800"></div>
                </div>
                <p className="font-medium group-hover:text-primary transition-colors">Freelancer {i + 1}</p>
                <p className="text-sm text-muted-foreground">Top-rated seller</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">What people are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border hover:shadow-lg transition">
              <div className="flex mb-4">
                {[...Array(5)].map((_, star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star < t.rating ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="italic mb-4 text-lg">{`"${t.quote}"`}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 text-center">
        <div className="container px-4 mx-auto space-y-6 max-w-4xl">
          <h2 className="text-4xl font-extrabold">Ready to start?</h2>
          <p className="text-xl">Create your profile or post your first job — it only takes a minute.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button asChild size="lg" className="bg-white text-primary font-semibold hover:scale-105 transition-transform">
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10 hover:scale-105 transition-transform">
              <Link href="/demo">See Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-white/80 mt-4">No credit card required · 7-day free trial</p>
        </div>
      </section>
    </main>
  )
}