import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ODDJobs</h3>
            <p className="text-sm text-muted-foreground">
              Connecting businesses with talented freelancers worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Graphic Design', 'Web Development', 'Writing', 'Video Editing'].map((category) => (
                <li key={category}>
                  <Link 
                    href={`/jobs?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="hover:text-primary transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Careers', 'Press', 'Partnerships', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Help Center', 'Terms of Service', 'Community', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ODDJobs. All rights reserved.
        </div>
      </div>
    </footer>
  )
}