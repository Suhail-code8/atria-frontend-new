import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import type { GeneratePosterResponse } from '../../api/events.api';

export type PosterStyle = 'vanguard' | 'aurora' | 'cyber' | 'luxe' | 'midnight';

export interface PosterEngineRef {
  download: () => void;
  getBlob: () => Promise<Blob | null>;
}

interface PosterEngineProps {
  data: GeneratePosterResponse | null;
  style: PosterStyle;
}

export const PosterEngine = forwardRef<PosterEngineRef, PosterEngineProps>(({ data, style }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    download: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      const title = data?.eventTitle || 'event';
      link.download = `atria-poster-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    },
    getBlob: async () => {
      return new Promise((resolve) => {
        if (!canvasRef.current) return resolve(null);
        canvasRef.current.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    }
  }));

  useEffect(() => {
    if (!data?.posterUrl) return;

    setImgLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = data.posterUrl;
    img.onload = () => {
      bgImgRef.current = img;
      setImgLoaded(true);
      draw();
    };
  }, [data?.posterUrl]);

  useEffect(() => {
    if (imgLoaded) {
      draw();
    }
  }, [imgLoaded, style]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = bgImgRef.current;
    if (!canvas || !img || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const formattedDate = new Date(data.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();

    // Set canvas dimensions to 1080x1350 (Social Media optimized)
    canvas.width = 1080;
    canvas.height = 1350;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Style-Specific Typography and Overlays
    switch (style) {
      case 'vanguard':
        drawVanguard(ctx, canvas.width, canvas.height, data, formattedDate);
        break;
      case 'aurora':
        drawAurora(ctx, canvas.width, canvas.height, data, formattedDate);
        break;
      case 'cyber':
        drawCyber(ctx, canvas.width, canvas.height, data, formattedDate);
        break;
      case 'luxe':
        drawLuxe(ctx, canvas.width, canvas.height, data, formattedDate);
        break;
      case 'midnight':
        drawMidnight(ctx, canvas.width, canvas.height, data, formattedDate);
        break;
      default:
        drawDefault(ctx, canvas.width, canvas.height, data);
    }

    // Apply "Powered by Atria" Watermark
    applyWatermark(ctx, canvas.width, canvas.height);
  };

  const drawVanguard = (ctx: CanvasRenderingContext2D, w: number, h: number, data: GeneratePosterResponse, formattedDate: string) => {
    ctx.save();
    // High-contrast brutalist text
    ctx.fillStyle = 'white';
    ctx.font = '900 120px Inter, sans-serif';
    ctx.textBaseline = 'top';
    const padding = 80;
    
    // Draw Title
    const titleLines = wrapText(ctx, data.eventTitle.toUpperCase(), w - (padding * 2));
    titleLines.forEach((line, i) => {
      ctx.fillText(line, padding, padding + (i * 110));
    });

    // Accent line
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(padding, padding + (titleLines.length * 110) + 20, 160, 15);

    // Bottom info
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillText(`${data.location} // ${formattedDate}`, padding, h - padding - 40);
    ctx.restore();
  };

  const drawAurora = (ctx: CanvasRenderingContext2D, w: number, h: number, data: GeneratePosterResponse, formattedDate: string) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, w, h); // Soft overlay
    
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = 'italic 500 100px serif';
    ctx.fillText(data.eventTitle, w / 2, h / 2 - 50);

    ctx.font = '300 24px Inter, sans-serif';
    ctx.letterSpacing = '10px';
    ctx.fillText(`${data.location.toUpperCase()} — ${formattedDate}`, w / 2, h / 2 + 50);
    ctx.restore();
  };

  const drawCyber = (ctx: CanvasRenderingContext2D, w: number, h: number, data: GeneratePosterResponse, formattedDate: string) => {
    ctx.save();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'white';
    ctx.font = '900 130px Inter, monospace';
    ctx.fillText(data.eventTitle, 60, h / 2);
    
    ctx.shadowBlur = 0;
    ctx.font = '700 20px Inter, monospace';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`[ STATUS: ACTIVE ] LOC: ${data.location.toUpperCase()} // DATE: ${formattedDate}`, 60, h / 2 + 100);
    ctx.restore();
  };

  const drawLuxe = (ctx: CanvasRenderingContext2D, w: number, h: number, data: GeneratePosterResponse, formattedDate: string) => {
    ctx.save();
    // Gold gradient for text
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#d4af37');
    grad.addColorStop(0.5, '#f9e076');
    grad.addColorStop(1, '#d4af37');
    
    ctx.textAlign = 'center';
    ctx.fillStyle = grad;
    ctx.font = '600 110px "Playfair Display", serif';
    ctx.fillText(data.eventTitle, w / 2, h / 2);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
    ctx.font = '400 20px Inter, sans-serif';
    ctx.letterSpacing = '15px';
    ctx.fillText(`${data.location.toUpperCase()} • ${formattedDate}`, w / 2, h / 2 + 80);
    ctx.restore();
  };

  const drawMidnight = (ctx: CanvasRenderingContext2D, w: number, h: number, data: GeneratePosterResponse, formattedDate: string) => {
    ctx.save();
    // Vignette
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, h/2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 140px Inter, sans-serif';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 30;
    ctx.fillText(data.eventTitle, 100, h - 350);
    
    ctx.shadowBlur = 0;
    ctx.font = '300 30px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${data.location.toUpperCase()} // ${formattedDate}`, 100, h - 250);
    ctx.restore();
  };

  const drawDefault = (ctx: CanvasRenderingContext2D, w: number, h: number, data: GeneratePosterResponse) => {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.fillText(data.eventTitle, 50, h - 150);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
  };

  const applyWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    const padding = 40;
    const text = "Powered by Atria";
    ctx.font = "bold 24px Inter, sans-serif";
    
    // Measure text for background
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    
    // Position: Bottom Right
    const x = width - textWidth - padding;
    const y = height - padding;

    // Subtle shadow for legibility on mixed backgrounds
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Semi-transparent white
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillText(text, x, y);

    ctx.restore();
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
      {!data && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-400">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 animate-spin" />
          <p className="text-sm font-medium">Ready to generate your design</p>
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        className={`w-full h-full object-contain transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {data && !imgLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-indigo-200 font-medium animate-pulse">Rendering Design...</p>
        </div>
      )}
    </div>
  );
});

PosterEngine.displayName = "PosterEngine";
