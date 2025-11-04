import { useRouter } from "next/router";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  LayoutGrid, 
  Users, 
  Zap, 
  Lock, 
  Cloud,
  Sparkles,
  ArrowRight,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Rich Text Editor",
      description: "Powerful document editing with real-time collaboration and formatting options."
    },
    {
      icon: <LayoutGrid className="w-6 h-6" />,
      title: "Kanban Boards",
      description: "Visual task management with drag-and-drop cards and multiple boards per project."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team on projects, documents, and tasks."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Built with Next.js and optimized for speed. Your productivity won't wait."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We take privacy seriously."
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Synced",
      description: "Access your work from anywhere. All your data syncs across devices."
    }
  ];

  return (
    <>
      <Head>
        <title>Docuboard - Collaborative Document & Project Management</title>
        <meta name="description" content="Powerful document editing with real-time collaboration, Kanban boards, and team management in one place." />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black tracking-tight">
                Docuboard
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-black transition-colors font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-black transition-colors font-medium">
                About
              </a>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-black hover:bg-gray-100"
              >
                Sign In
              </Button>
              <Button 
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => router.push('/login')}
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <a href="#features" className="block text-gray-600 hover:text-black py-2 font-medium">
                Features
              </a>
              <a href="#about" className="block text-gray-600 hover:text-black py-2 font-medium">
                About
              </a>
              <Button 
                variant="ghost" 
                className="w-full hover:bg-gray-100"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button 
                className="w-full bg-black hover:bg-gray-800 text-white"
                onClick={() => router.push('/login')}
              >
                Get Started Free
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium mb-8 border border-black">
            <Sparkles className="w-4 h-4" />
            <span>Free Forever</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight tracking-tight">
            Your Creative Workspace,
            <br />
            <span className="text-black">
              Beautifully Simple
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Combine powerful document editing and visual Kanban boards in one elegant platform. 
            Everything you need to bring your ideas to life—completely free.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-6 transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </Button>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-16 relative">
            <div className="relative bg-white border-2 border-black overflow-hidden">
              <div className="bg-white px-4 py-3 flex items-center gap-2 border-b-2 border-black">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-black" />
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 text-center text-sm text-black font-medium">Docuboard - Your Projects</div>
              </div>
              <div className="p-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 border-2 border-black hover:translate-x-1 hover:-translate-y-1 transition-transform">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-black flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-black">Documents</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 w-3/4" />
                      <div className="h-3 bg-gray-100 w-1/2" />
                      <div className="h-3 bg-gray-200 w-2/3" />
                    </div>
                  </div>
                  <div className="bg-white p-6 border-2 border-black hover:translate-x-1 hover:-translate-y-1 transition-transform">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-black flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-black">Kanban Boards</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 w-2/3" />
                      <div className="h-3 bg-gray-100 w-3/4" />
                      <div className="h-3 bg-gray-200 w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
              Everything you need, nothing you don't
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Simple yet powerful features designed to help you and your team work better together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 border-2 border-gray-200 hover:border-black transition-all duration-300 bg-white"
              >
                <div className="w-14 h-14 bg-black flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About/CTA Section */}
      <section id="about" className="py-24 px-4 bg-black text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium mb-6 border-2 border-white">
            <Sparkles className="w-4 h-4" />
            <span>100% Free • Forever</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
            Start creating something amazing today
          </h2>
          <p className="text-xl mb-10 text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {/* No credit card required. No time limits. No hidden fees.  */}
            Just sign up and start building your projects right away.
          </p>
          <Button 
            size="lg"
            className="bg-white text-black hover:bg-gray-200 text-lg px-10 py-7 transition-all duration-300 font-semibold"
            onClick={() => router.push('/login')}
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-12 px-4 border-t-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            {/* <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">Docuboard</span>
              </div>
              <p className="text-sm text-gray-500">
                Your creative workspace for documents and project management—completely free.
              </p>
            </div> */}

            {/* Product */}
            {/* <div>
              <h4 className="text-black font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Updates</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Roadmap</a></li>
                <li><a href="/login" className="hover:text-black transition-colors">Get Started</a></li>
              </ul>
            </div> */}

            {/* Company */}
            {/* <div>
              <h4 className="text-black font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-black transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div> */}

            {/* Legal */}
            {/* <div>
              <h4 className="text-black font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-black transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Cookies</a></li>
              </ul>
            </div> */}
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Docuboard. Made with ❤️ for creators everywhere.
            </p>
            {/* <div className="flex gap-6">
              <a href="#" className="hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-black transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-black transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
