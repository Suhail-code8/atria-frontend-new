import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Ghost, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative"
      >
        <div className="text-[180px] font-black leading-none text-slate-100 dark:text-slate-800/50 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-full shadow-2xl border border-white/20">
            <Ghost className="w-16 h-16 text-primary animate-bounce" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 max-w-md"
      >
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-secondary text-lg mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have vanished into the void. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto min-w-[140px] flex items-center gap-2 border-slate-200 shadow-sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full min-w-[140px] flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Home size={18} />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
