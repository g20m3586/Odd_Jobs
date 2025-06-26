"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle2, Zap, Briefcase, Layers } from "lucide-react"

export default function Home() {
  const [query, setQuery] = useState("")
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    // Assuming you want to route to jobs page with search query
    window.location.href = `/jobs?search=${encodeURIComponent(query.trim())}`
  }

  const popularTags = [
    "Logo Design",
    "WordPress",
    "Voice Over",
    "Social Media",
  ]

  const trustedBy = [
    "Netflix",
    "Google",
    "Meta",
    "PayPal",
    "Microsoft",
  ]

  const popularServices = [
    { 
      name: "Build your brand", 
      description: "Logo design", 
      icon: <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
    },
    { 
      name: "Customize your site", 
      description: "WordPress", 
      icon: <Layers className="w-16 h-16 text-primary mx-auto" />
    },
    { 
      name: "Share your message", 
      description: "Voice Over", 
      icon: <Zap className="w-16 h-16 text-primary mx-auto" />
    },
    { 
      name: "Engage your audience", 
      description: "Social Media", 
      icon: <Briefcase className="w-16 h-16 text-primary mx-auto" />
    },
  ]

  const sellerShowcase = [
    {
      title: "The best for every budget",
      description:
        "Find high-quality services at every price point. No hourly rates, just project-based pricing.",
      icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
    },
    {
      title: "Quality work done quickly",
      description: "Find the right freelancer to begin working on your project within minutes.",
      icon: <Zap className="w-12 h-12 text-primary" />,
    },
  ]

  const categories = [
    { name: "Graphics & Design", icon: <CheckCircle2 /> },
    { name: "Digital Marketing", icon: <Search /> },
    { name: "Writing & Translation", icon: <Briefcase /> },
    { name: "Video & Animation", icon: <Zap /> },
    { name: "Music & Audio", icon: <Layers /> },
    { name: "Programming & Tech", icon: <CheckCircle2 /> },
    { name: "Business", icon: <Briefcase /> },
    { name: "Lifestyle", icon: <Zap /> },
    { name: "Data", icon: <Search /> },
    { name: "Photography", icon: <Layers /> },
    { name: "AI Services", icon: <CheckCircle2 /> },
    { name: "Trending", icon: <Zap /> },
  ]

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-primary">Find</span> the perfect freelance services for your business
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              aria-label="Search for services"
              placeholder="What service are you looking for today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm pr-32 text-lg transition"
            />
            <Button
              type="submit"
              className="absolute right-2 top-2 px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform"
              aria-label="Search"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </form>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {popularTags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="rounded-full px-5 hover:bg-primary hover:text-white transition"
                onClick={() => {
                  setQuery(tag)
                  // optionally trigger search immediately or leave for manual click
                }}
                aria-label={`Search for ${tag}`}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-muted-foreground text-sm mb-6">Trusted by</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70">
            {trustedBy.map((company) => (
              <span
                key={company}
                className="text-lg font-semibold text-gray-600 dark:text-gray-400 select-none"
                aria-label={company}
                title={company}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-extrabold mb-10 text-center">Popular professional services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {popularServices.map(({ name, description, icon }) => (
            <Link
              key={name}
              href="/jobs"
              className="group bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center hover:shadow-lg transition-shadow"
              aria-label={`${name}: ${description}`}
            >
              <div className="mb-6">{icon}</div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-muted-foreground text-center">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Seller Showcase */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold mb-8">A whole world of freelance talent at your fingertips</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left mt-10">
            {sellerShowcase.map(({ title, description, icon }, i) => (
              <div key={i} className="flex gap-6">
                <div className="text-primary">{icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-extrabold mb-10 text-center">Browse by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map(({ name, icon }) => (
            <Link
              key={name}
              href={`/jobs?category=${encodeURIComponent(name.toLowerCase())}`}
              className="border rounded-lg p-6 flex flex-col items-center hover:shadow-lg transition-shadow cursor-pointer"
              aria-label={`Browse jobs in ${name} category`}
            >
              <div className="text-primary mb-3">{icon}</div>
              <h3 className="font-semibold text-center">{name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-8">
            Find the talent needed to get your business growing.
          </h2>
          <Button asChild size="lg" className="px-12 py-6 text-lg hover:scale-105 transition-transform shadow-lg">
            <Link href="/auth/signup" aria-label="Get started now">
              Get Started
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
