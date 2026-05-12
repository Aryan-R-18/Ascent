import { Target, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--glass-border)] bg-background/30 backdrop-blur-md mt-auto pt-6 pb-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Side: Brand & Logo */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-primary" />
            <span className="font-bold text-lg tracking-tight">ClubSync</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Next-generation club operations & management. <br className="hidden md:block" />
            Designed for vibrant communities.
          </p>
        </div>

        {/* Center: Social Links Placeholder */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors" aria-label="GitHub">
            <Github size={18} />
          </Link>
          <Link href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
            <Twitter size={18} />
          </Link>
          <Link href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
            <Linkedin size={18} />
          </Link>
          <Link href="#" className="hover:text-primary transition-colors" aria-label="Email">
            <Mail size={18} />
          </Link>
        </div>

        {/* Right Side: Credit */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          Made by <Target size={16} className="text-primary animate-pulse" /> 
          <span className="text-foreground tracking-wide font-bold">Enigma VSSUT</span>
        </div>
        
      </div>
      
      {/* Bottom Separator */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-primary/5 mt-6 pt-4 text-[11px] text-muted-foreground/60 uppercase tracking-widest font-semibold">
        <p>© {new Date().getFullYear()} ClubSync Platform</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
