export function Footer() {
  return (
    <footer className="bg-white/70 backdrop-blur-xl border-t border-white py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500 font-medium">
        <p>&copy; {new Date().getFullYear()} Fintilla. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
