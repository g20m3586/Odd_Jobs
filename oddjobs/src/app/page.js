import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Fiverr-style */}
      <section className="w-full bg-gradient-to-r from-primary/5 to-secondary/5 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-primary">Find</span> the perfect freelance services for your business
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <input 
                type="text" 
                placeholder="What service are you looking for today?" 
                className="w-full px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
              />
              <Button className="absolute right-2 top-2 px-6 py-2 text-lg  rounded-full">
                Search
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['Logo Design', 'WordPress', 'Voice Over', 'Social Media'].map((tag) => (
                <Button key={tag} variant="outline" size="sm" className="rounded-full">
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className=" py-8">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-muted-foreground text-sm mb-4">Trusted by</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {['Netflix', 'Google', 'Meta', 'PayPal', 'Microsoft'].map((company) => (
              <div key={company} className="text-lg font-medium text-gray-600">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services - Fiverr-style */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular professional services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              name: 'Build your brand', 
              description: 'Logo design', 
              image: '/placeholder-design.jpg' 
            },
            { 
              name: 'Customize your site', 
              description: 'WordPress', 
              image: '/placeholder-wordpress.jpg' 
            },
            { 
              name: 'Share your message', 
              description: 'Voice Over', 
              image: '/placeholder-voice.jpg' 
            },
            { 
              name: 'Engage your audience', 
              description: 'Social Media', 
              image: '/placeholder-social.jpg' 
            },
          ].map((service) => (
            <Link 
              key={service.name}
              href="/jobs"
              className="group"
            >
              <div className="overflow-hidden rounded-lg aspect-video bg-gray-100 mb-3">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-4xl">📷</span>
                </div>
              </div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {service.name}
              </h3>
              <p className="text-muted-foreground">{service.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Seller Showcase */}
      <section className=" py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">A whole world of freelance talent at your fingertips</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left mt-8">
              {[
                {
                  title: 'The best for every budget',
                  description: 'Find high-quality services at every price point. No hourly rates, just project-based pricing.',
                  icon: '💰',
                },
                {
                  title: 'Quality work done quickly',
                  description: 'Find the right freelancer to begin working on your project within minutes.',
                  icon: '⚡',
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Browse by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Graphics & Design', icon: '🎨' },
            { name: 'Digital Marketing', icon: '📈' },
            { name: 'Writing & Translation', icon: '✍️' },
            { name: 'Video & Animation', icon: '🎬' },
            { name: 'Music & Audio', icon: '🎵' },
            { name: 'Programming & Tech', icon: '💻' },
            { name: 'Business', icon: '💼' },
            { name: 'Lifestyle', icon: '🌿' },
            { name: 'Data', icon: '📊' },
            { name: 'Photography', icon: '📷' },
            { name: 'AI Services', icon: '🤖' },
            { name: 'Trending', icon: '🔥' },
          ].map((category) => (
            <Link
              key={category.name}
              href={`/jobs?category=${encodeURIComponent(category.name.toLowerCase())}`}
              className="border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer text-center"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Find the talent needed to get your business growing.</h2>
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}