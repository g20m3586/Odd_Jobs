import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Find the perfect <span className="text-primary">freelance</span> services for your business
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect with talented freelancers for any project, any budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="px-8 py-4 text-lg">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button variant="outline" asChild className="px-8 py-4 text-lg">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Popular Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: 'Graphic Design', icon: '🎨' },
            { name: 'Web Development', icon: '💻' },
            { name: 'Content Writing', icon: '✍️' },
            { name: 'Digital Marketing', icon: '📈' },
            { name: 'Video Editing', icon: '🎬' },
            { name: 'Social Media', icon: '📱' },
            { name: 'SEO', icon: '🔍' },
            { name: 'Voice Over', icon: '🎙️' },
          ].map((service) => (
            <div 
              key={service.name}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-medium">{service.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">How ODDJobs Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Find the perfect service',
                description: 'Browse thousands of services and filter by category, price, and rating.',
                icon: '🔍',
              },
              {
                title: 'Connect with freelancers',
                description: 'Message freelancers directly to discuss your project details.',
                icon: '💬',
              },
              {
                title: 'Pay securely',
                description: 'Only pay when you\'re satisfied with the delivered work.',
                icon: '💳',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}