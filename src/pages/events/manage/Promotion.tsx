import { useState, useRef,useEffect } from "react";
import { useParams } from "react-router-dom";
import { eventsApi } from "../../../api/events.api";
import type { GeneratePosterResponse } from "../../../api/events.api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Sparkles, Download, Share2, Layers, Zap, Moon, Sun, Monitor, Wand2, Loader2, Terminal, ChevronDown, Palette, History } from "lucide-react";
import { PosterEngine } from "../../../components/events/PosterEngine";
import type { PosterEngineRef, PosterStyle } from "../../../components/events/PosterEngine";
import { AnimatePresence,motion } from "framer-motion";

const STYLES: { id: PosterStyle; label: string; icon: any; desc: string; defaultPrompt: string }[] = [
  { 
    id: 'vanguard', 
    label: 'Vanguard', 
    icon: Zap, 
    desc: 'Bold, brutalist, high-energy',
    defaultPrompt: 'A premium, avant-garde Brutalist event poster for a [TYPE] named "[EVENT]". High-contrast black and white palette with sharp cherry-red accents. Huge, oversized bold grotesque typography for "[EVENT]". Experimental layout with distorted grid lines and grain textures. Professional Swiss graphic design style, ultra-sharp vector feel. Date: [DATE], [YEAR]. Location: [LOCATION].'
  },
  { 
    id: 'aurora', 
    label: 'Aurora', 
    icon: Sun, 
    desc: 'Ethereal, soft, elegant',
    defaultPrompt: 'An ultra-premium, ethereal Aurora-style promotional poster for "[EVENT]". Soft, flowing iridescent liquid gradients in lavender, mint, and peach. Delicate glassmorphism overlays with blurred background elements. Elegant high-contrast serif typography for "[EVENT]". Sharp, minimalist layouts. Date: [DATE]. Location: [LOCATION]. [DESCRIPTION].'
  },
  { 
    id: 'cyber', 
    label: 'Cyber', 
    icon: Monitor, 
    desc: 'Neon, technical, futurist',
    defaultPrompt: 'A high-fidelity futuristic Cyberpunk event poster for "[EVENT]". Deep obsidian background with vibrant neon cyan and hot pink laser grid lines. Title "[EVENT]" in glowing, multi-layered glitch-effect typography. Technical HUD elements, digital noise artifacts. Futuristic [TYPE] event at [LOCATION] on [DATE], [YEAR].'
  },
  { 
    id: 'luxe', 
    label: 'Luxe', 
    icon: Layers, 
    desc: 'Upscale, minimal, premium',
    defaultPrompt: 'An opulent luxury event poster for "[EVENT]". Background of exquisite white Calacatta marble with gold veins. Main title "[EVENT]" in 3D embossed gold-foil serif typography. High-end fashion magazine layout with expansive white space. Date: [DATE]. Location: [LOCATION]. [DESCRIPTION].'
  },
  { 
    id: 'midnight', 
    label: 'Midnight', 
    icon: Moon, 
    desc: 'Mystical, dark, cinematic',
    defaultPrompt: 'A moody cinematic Midnight-noir poster for "[EVENT]". Silhouetted urban environment in deep indigo and charcoal. Foggy atmosphere with a warm golden glow illuminating the title "[EVENT]". Tall, condensed sans-serif typography with subtle outer glow. Dramatic shadows, atmospheric depth. [DATE], [LOCATION].'
  },
];

export function Promotion() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null); // Replace any with proper Event type from imports
  const [posterData, setPosterData] = useState<GeneratePosterResponse | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<PosterStyle>('vanguard');
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generationStep, setGenerationStep] = useState<string>("");
  const engineRef = useRef<PosterEngineRef>(null);

  useEffect(() => {
    if (id) {
      eventsApi.getEvent(id).then(res => {
        if (res.data.success) {
          setEvent(res.data.data);
        }
      }).catch(err => console.error("Failed to fetch event:", err));
    }
  }, [id]);

  const resolvePrompt = (template: string) => {
    if (!event) return template;
    
    const date = new Date(event.startDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
    const year = new Date(event.startDate).getFullYear().toString();
    const truncatedDesc = event.description?.length > 100 
      ? event.description.substring(0, 100) + '...'
      : event.description;

    return template
      .replace(/\[EVENT\]/g, event.title || "")
      .replace(/\[DATE\]/g, date)
      .replace(/\[YEAR\]/g, year)
      .replace(/\[LOCATION\]/g, event.location || "")
      .replace(/\[TYPE\]/g, event.eventType || "special")
      .replace(/\[DESCRIPTION\]/g, truncatedDesc || "");
  };

  useEffect(() => {
    const style = STYLES.find(s => s.id === selectedStyle);
    if (style && !customPrompt) {
      setCustomPrompt(resolvePrompt(style.defaultPrompt));
    }
  }, [selectedStyle, event]); // Re-run when style OR event data changes

  const generatePoster = async () => {
    if (!id) return;
    setGenerating(true);
    setGenerationStep("Analyzing Event Data...");

    try {
      setTimeout(() => setGenerationStep("Synthesizing Visual Layout..."), 1500);
      setTimeout(() => setGenerationStep("Generating High-Fidelity Artwork..."), 3500);

      const res = await eventsApi.generateEventPoster(id, selectedStyle, customPrompt || undefined);
      setPosterData(res.data.data);
      
      // Refresh event to see new poster in history
      const eventRes = await eventsApi.getEvent(id);
      if (eventRes.data.success) {
        setEvent(eventRes.data.data);
      }
    } catch (err: any) {
      alert("Failed to generate poster: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
      setGenerationStep("");
    }
  };

  const handleDownload = () => {
    engineRef.current?.download();
  };

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
             <Wand2 className="text-indigo-600" /> Promotion
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Generate AI marketing assets and manage event visibility.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 rounded-xl">
             <Share2 size={18} /> Public Page
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Poster Preview */}
        <Card className="lg:col-span-7 flex flex-col overflow-hidden border-none shadow-2xl bg-white/50 backdrop-blur-xl">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="flex items-center gap-2 text-xl italic"><Sparkles className="text-indigo-400 fill-indigo-400" /> Advanced AI Poster Generator</CardTitle>
            <CardDescription className="text-slate-400">Professional 1080x1350 designs with integrated typography.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 bg-slate-100 flex items-center justify-center relative min-h-[600px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center gap-6 p-12 text-indigo-600">
                <div className="relative">
                   <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                   <Sparkles className="absolute inset-0 m-auto w-10 h-10 animate-pulse text-indigo-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black text-2xl tracking-tight">{generationStep || "AI is designing your poster..."}</p>
                  <p className="text-slate-500 font-medium">Synthesizing layouts, fonts, and atmosphere</p>
                  <div className="flex gap-1 justify-center mt-4">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            ) : posterData ? (
              <PosterEngine 
                ref={engineRef}
                data={posterData} 
                style={selectedStyle} 
              />
            ) : (
              <div className="text-center p-12">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                   <Sparkles className="w-12 h-12 text-indigo-500 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Ready to wow your audience?</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm uppercase tracking-widest font-medium">Select a style and hit generate</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
            <div className="flex w-full gap-4">
              <Button 
                onClick={generatePoster} 
                disabled={generating} 
                className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {generating ? <Loader2 className="mr-2 animate-spin" size={20} /> : <Sparkles className="mr-2" size={20} />}
                {generating ? "Crafting Design..." : posterData ? "Regenerate Full Design" : "Generate AI Poster"}
              </Button>
              {posterData && (
                <Button onClick={handleDownload} variant="secondary" className="h-14 px-8 rounded-2xl font-bold hover:bg-slate-200">
                   <Download size={20} />
                </Button>
              )}
            </div>

            {/* Advanced Toggle */}
            <div className="border-t border-slate-200 pt-4">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Terminal size={14} /> 
                {showAdvanced ? "Hide Advanced Controls" : "Advanced: Custom Prompt Override"}
                <ChevronDown className={`transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`} size={14} />
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Design Instruction (Prompt)</label>
                       <textarea 
                         value={customPrompt}
                         onChange={(e) => setCustomPrompt(e.target.value)}
                         className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 text-sm font-mono text-slate-700 bg-white"
                         placeholder="Describe exactly what the AI should design..."
                       />
                       <p className="text-[10px] text-slate-400">Pro-tip: You can specify exact text positions, colors, and artistic movements.</p>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => {
                            const style = STYLES.find(s => s.id === selectedStyle);
                            if (style) setCustomPrompt(style.defaultPrompt);
                         }}
                         className="text-xs h-8 px-2"
                       >
                         Reset to Style Default
                       </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardFooter>
        </Card>

        {/* Style Selection & Tools */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Palette size={18} className="text-indigo-600" />
                <CardTitle className="text-lg">Visual Identity</CardTitle>
              </div>
              <CardDescription>Choose the mood and layout for your poster.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {STYLES.map((s) => {
                const Icon = s.icon;
                const active = selectedStyle === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStyle(s.id);
                      setCustomPrompt(resolvePrompt(s.defaultPrompt)); // Reset prompt when style changes
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                      active 
                        ? 'bg-indigo-50 border-indigo-600 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-600'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className={`font-bold transition-colors ${active ? 'text-indigo-900' : 'text-slate-900'}`}>{s.label}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="h-2 bg-indigo-600" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Share2 size={18} className="text-indigo-600" />
                <CardTitle className="text-lg">Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-3 justify-start h-12 rounded-xl hover:bg-slate-50 transition-colors" disabled={!posterData}>
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Share2 size={16} className="text-pink-600" />
                </div>
                Share to Instagram Stories
              </Button>
              <Button variant="outline" className="w-full gap-3 justify-start h-12 rounded-xl hover:bg-slate-50 transition-colors" disabled={!posterData}>
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Share2 size={16} className="text-sky-500" />
                </div>
                Post to Twitter / X
              </Button>
              <Button variant="outline" className="w-full gap-3 justify-start h-12 rounded-xl hover:bg-slate-50 transition-colors" disabled={!posterData}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Share2 size={16} className="text-blue-600" />
                </div>
                Share on LinkedIn
              </Button>
            </CardContent>
          </Card>

          {/* Design History Gallery */}
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <History className="text-indigo-600" size={18} />
                <CardTitle className="text-lg">Design History</CardTitle>
              </div>
              <CardDescription>Previous iterations for this event.</CardDescription>
            </CardHeader>
            <CardContent>
              {event?.generatedPosters?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {event.generatedPosters.slice().reverse().map((p: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setSelectedStyle(p.style as any);
                        setPosterData({
                          posterUrl: p.url,
                          eventTitle: event.title,
                          startDate: event.startDate,
                          location: event.location,
                          eventType: event.eventType,
                          eventDescription: event.description
                        });
                        setCustomPrompt(p.prompt);
                      }}
                      className="group relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-slate-100 hover:border-indigo-600 transition-all"
                    >
                      <img src={p.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Cached Poster" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">{p.style}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No History Yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

