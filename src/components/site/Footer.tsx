import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, Instagram, Mail } from "lucide-react";
import logo from "@/assets/logo-coachrony.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img src={logo} alt="Coachrony Academy" className="h-9 w-auto" />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              AI দিয়ে নিজের স্কিল, ব্র্যান্ড ও ইনকাম তৈরি করুন। Content, Vibe Coding, Digital
              Products ও Online Business — সব এক জায়গায়।
            </p>
            <div className="mt-5 flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="glass rounded-xl p-2 hover:text-primary"><Facebook className="h-4 w-4" /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="glass rounded-xl p-2 hover:text-primary"><Youtube className="h-4 w-4" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="glass rounded-xl p-2 hover:text-primary"><Instagram className="h-4 w-4" /></a>
              <a href="mailto:coachronyacademy@gmail.com" className="glass rounded-xl p-2 hover:text-primary"><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
              <li><Link to="/programs" className="hover:text-foreground">Programs</Link></li>
              <li><Link to="/portfolio" className="hover:text-foreground">Portfolio</Link></li>
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/free-class" className="hover:text-foreground">Free Class</Link></li>
              <li><Link to="/book" className="hover:text-foreground">Book a Call</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CoachRony. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
