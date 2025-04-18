
import { Mail, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-newsprint text-paper py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="font-display text-3xl font-black tracking-tighter mb-4">
              <span className="text-newsprint-red">P</span>aperboy
            </div>
            <p className="text-paper-aged mb-4 max-w-md">
              Personalized research papers delivered to your inbox daily. 
              Stay at the forefront of your field without the endless searching.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-paper-aged hover:text-white transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="#" className="text-paper-aged hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-paper-aged hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4 text-lg">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-paper-aged hover:text-white transition-colors no-underline">Features</a></li>
              <li><a href="#pricing" className="text-paper-aged hover:text-white transition-colors no-underline">Pricing</a></li>
              <li><a href="#faq" className="text-paper-aged hover:text-white transition-colors no-underline">FAQ</a></li>
              <li><a href="#" className="text-paper-aged hover:text-white transition-colors no-underline">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold mb-4 text-lg">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-paper-aged hover:text-white transition-colors no-underline">About</a></li>
              <li><a href="#" className="text-paper-aged hover:text-white transition-colors no-underline">Careers</a></li>
              <li><a href="#" className="text-paper-aged hover:text-white transition-colors no-underline">Privacy</a></li>
              <li><a href="#" className="text-paper-aged hover:text-white transition-colors no-underline">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-newsprint-light/20 pt-8 text-paper-aged text-sm flex flex-col md:flex-row justify-between items-center">
          <div>© {new Date().getFullYear()} Paperboy. All rights reserved.</div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="hover:text-white transition-colors no-underline">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors no-underline">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors no-underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
