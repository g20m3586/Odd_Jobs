"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Search, Sparkles } from "lucide-react"

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    window.location.href = `/jobs?search=${encodeURIComponent(query.trim())}`
  }

  return (
    <main className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      {/* Hero */}
      <section className="py-24 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container px-4 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Hire smarter. Work faster. <br />
            <span className="text-primary">ODDJobs connects freelancers and clients seamlessly.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A modern freelance marketplace to find and offer high-quality services in minutes.
          </p>
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mt-6">
            <input
              type="text"
              placeholder="Search jobs or services"
              className="w-full py-4 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm pr-32 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              type="submit"
              className="absolute top-1.5 right-2 px-6 py-2 rounded-full"
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
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
              className="p-6 border rounded-lg hover:shadow-md text-center transition"
            >
              <Sparkles className="mx-auto text-primary mb-4" />
              <h3 className="font-semibold">{service}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="bg-zinc-50 dark:bg-zinc-800 py-20">
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
            <p className="text-muted-foreground">
              Whether you’re building a website or scaling your brand, we help you find the right people to get it done.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Simple, transparent pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: "Free", price: "$0", features: ["Browse jobs", "Apply to listings", "Build your profile"] },
            { title: "Pro", price: "$12/mo", features: ["Priority listings", "Advanced filters", "Analytics dashboard"] },
            { title: "Business", price: "$29/mo", features: ["Team hiring tools", "Direct freelancer invites", "Dedicated support"] }
          ].map((plan, i) => (
            <div key={i} className="border rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="bg-zinc-100 dark:bg-zinc-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Meet our top freelancers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {avatars.map((src, i) => (
              <div key={i} className="text-center space-y-2">
                <img
                  src={src}
                  alt={`Freelancer ${i + 1}`}
                  className="w-20 h-20 rounded-full mx-auto border-2 border-primary"
                />
                <p className="font-medium">Freelancer {i + 1}</p>
                <p className="text-sm text-muted-foreground">Top-rated seller</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">What people are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "ODDJobs helped me find a web developer in under 10 minutes. Incredible!",
              name: "Lebo M.",
              title: "Startup Founder"
            },
            {
              quote: "I earn consistently through this platform. Clients trust me here.",
              name: "Nate S.",
              title: "Freelance Designer"
            },
            {
              quote: "The hiring process is so easy — we use it every month.",
              name: "Jess T.",
              title: "Operations Lead"
            }
          ].map((t, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border">
              <p className="italic mb-4">"{t.quote}"</p>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-white py-20 text-center">
        <div className="container px-4 mx-auto space-y-4">
          <h2 className="text-4xl font-extrabold">Ready to start?</h2>
          <p className="text-lg">Create your profile or post your first job — it only takes a minute.</p>
          <Button asChild size="lg" className="bg-white text-primary font-semibold hover:scale-105 transition-transform">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
