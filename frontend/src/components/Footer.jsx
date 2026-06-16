import { BookOpen, Mail, Share2, Globe, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="ml-3 text-lg font-bold text-text tracking-tight">SmartLibrary</span>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Empowering readers with smart technology. Manage your reading life effortlessly with our AI-powered library system.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4">
              {['Library Catalog', 'Member Benefits', 'Reading Lists', 'AI Recommendations'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Borrowing Rules', 'Fines & Payments', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Connect</h4>
            <div className="flex space-x-4 mb-6">
              {[Globe, Share2, ExternalLink, Mail].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-medium italic">
              Subscribe to our newsletter for new arrivals and reading tips.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          <p>© 2026 SmartLibrary. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
