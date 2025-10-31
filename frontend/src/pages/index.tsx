import { useRouter } from "next/router";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-lg border-b border-indigo-100/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Docuboard
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                About
              </a>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-indigo-600"
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200/50"
                onClick={() => router.push('/login')}
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-indigo-600 py-2 font-medium">
                Features
              </a>
              <a href="#about" className="block text-gray-600 hover:text-indigo-600 py-2 font-medium">
                About
              </a>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-8 border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            <span>Free Forever</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Creative Workspace,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg px-8 py-6 shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </Button>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 blur-3xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-indigo-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 flex items-center gap-2 border-b border-indigo-100">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 text-center text-sm text-indigo-700 font-medium">Docuboard - Your Projects</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100/50 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Documents</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-indigo-100 rounded-full w-3/4" />
                      <div className="h-3 bg-indigo-50 rounded-full w-1/2" />
                      <div className="h-3 bg-indigo-100 rounded-full w-2/3" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Kanban Boards</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-purple-100 rounded-full w-2/3" />
                      <div className="h-3 bg-purple-50 rounded-full w-3/4" />
                      <div className="h-3 bg-purple-100 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
                className="group p-8 rounded-2xl border border-indigo-100/50 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
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
      <section id="about" className="py-24 px-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02ek0yNCA0NGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span>100% Free • Forever</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Start creating something amazing today
          </h2>
          <p className="text-xl mb-10 text-white/90 leading-relaxed max-w-2xl mx-auto">
            {/* No credit card required. No time limits. No hidden fees.  */}
            Just sign up and start building your projects right away.
          </p>
          <Button 
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-10 py-7 shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 font-semibold"
            onClick={() => router.push('/login')}
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-white text-gray-600 py-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            {/* <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Docuboard</span>
              </div>
              <p className="text-sm text-gray-500">
                Your creative workspace for documents and project management—completely free.
              </p>
            </div> */}

            {/* Product */}
            {/* <div>
              <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Updates</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Roadmap</a></li>
                <li><a href="/login" className="hover:text-indigo-600 transition-colors">Get Started</a></li>
              </ul>
            </div> */}

            {/* Company */}
            {/* <div>
              <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-indigo-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div> */}

            {/* Legal */}
            {/* <div>
              <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a></li>
              </ul>
            </div> */}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Docuboard. Made with ❤️ for creators everywhere.
            </p>
            {/* <div className="flex gap-6">
              <a href="#" className="hover:text-indigo-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
