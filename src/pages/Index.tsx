import { useState } from "react";
import megamindLogo from "@/assets/megamind-logo.png";
import neuralBg from "@/assets/neural-bg.jpg";
import FingerprintScanner from "@/components/FingerprintScanner";
import NeuralStats from "@/components/NeuralStats";
import BrainActivityPanel from "@/components/BrainActivityPanel";
import DataStream from "@/components/DataStream";
import NeuralBrain3D from "@/components/NeuralBrain3D";
import DNAHelix3D from "@/components/DNAHelix3D";
import Heart3D from "@/components/Heart3D";
import BrainAnalysisResults from "@/components/BrainAnalysisResults";
import DNAAnalysisResults from "@/components/DNAAnalysisResults";
import HeartAnalysisResults from "@/components/HeartAnalysisResults";
import ReportExport from "@/components/ReportExport";
import BrainChatbot from "@/components/BrainChatbot";
import { Shield, Zap, Layers, Dna, Heart, Brain } from "lucide-react";

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={neuralBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={megamindLogo} alt="MegaMind" width={36} height={36} className="sm:w-10 sm:h-10" />
            <span className="font-orbitron text-sm sm:text-lg font-bold tracking-wider text-foreground">
              MEGA<span className="text-primary text-glow-cyan">MIND</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition-colors">Neural Scan</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Brain Map</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Analytics</span>
          </div>
          <div className="px-3 sm:px-4 py-2 rounded border border-primary/30 font-orbitron text-[10px] sm:text-xs text-primary hover:bg-primary/10 cursor-pointer transition-colors">
            CONNECT
          </div>
        </nav>

        {/* Hero - Title */}
        <section className="px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-6">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 font-mono text-xs text-primary">
              <Zap className="w-3 h-3" /> NEURAL INTERFACE v4.0
            </div>
            <h1 className="font-orbitron text-2xl sm:text-4xl lg:text-6xl font-bold leading-tight">
              Clone Your{" "}
              <span className="text-primary text-glow-cyan">Brain</span>
              {", "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">DNA</span>
              {" & "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Heart</span>
              {" "}Through Touch
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              MegaMind reads neural patterns, extracts DNA from epithelial cells, and analyzes cardiac signatures through fingerprint contact — mapping your complete biological architecture in real-time.
            </p>
          </div>
        </section>

        {/* Scanner + 3D Models */}
        <section className="px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Scanner + Brain row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Scanner Box */}
              <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm p-4 sm:p-8 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px]">
                <h3 className="font-orbitron text-xs sm:text-sm tracking-widest uppercase text-secondary text-center mb-6">
                  Neural Fingerprint Scanner
                </h3>
                <FingerprintScanner onScanningChange={setIsScanning} onScanComplete={() => setScanComplete(true)} />
              </div>

              {/* 3D Brain */}
              <div className="min-h-[280px] sm:min-h-[450px]">
                <NeuralBrain3D scanning={isScanning} />
              </div>

              {/* 3D DNA */}
              <div className="min-h-[280px] sm:min-h-[450px]">
                <DNAHelix3D scanning={isScanning} />
              </div>

              {/* 3D Heart */}
              <div className="min-h-[280px] sm:min-h-[450px]">
                <Heart3D scanning={isScanning} />
              </div>
            </div>
          </div>

          {/* Connection explanation */}
          <div className="max-w-7xl mx-auto mt-6 p-4 rounded-xl border border-border/50 bg-card/20 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { num: "01", title: "Fingerprint Contact", desc: "3,000+ nerve endings per cm² connect; epithelial cells nano-collected", color: "text-primary", bg: "bg-primary/10" },
                { num: "02", title: "Neural Capture", desc: "Bioelectric signals map neural pathways at 120 m/s", color: "text-secondary", bg: "bg-secondary/10" },
                { num: "03", title: "DNA Extraction", desc: "Nanopore sequencers read 3.2B base pairs from skin cells", color: "text-green-400", bg: "bg-green-500/10" },
                { num: "04", title: "Heart Cloning", desc: "Pulse wave analysis reconstructs full cardiac digital twin", color: "text-red-400", bg: "bg-red-500/10" },
              ].map(s => (
                <div key={s.num} className="space-y-1">
                  <div className={`w-8 h-8 mx-auto rounded-lg ${s.bg} flex items-center justify-center`}>
                    <span className={`font-orbitron text-xs font-bold ${s.color}`}>{s.num}</span>
                  </div>
                  <p className="font-orbitron text-[10px] font-bold text-foreground uppercase tracking-wider">{s.title}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brain Analysis Results */}
        <BrainAnalysisResults visible={scanComplete} />

        {/* DNA Analysis Results */}
        <DNAAnalysisResults visible={scanComplete} />

        {/* Heart Analysis Results */}
        <HeartAnalysisResults visible={scanComplete} />

        {/* Report Export */}
        <ReportExport visible={scanComplete} />

        {/* Stats */}
        <section className="px-4 sm:px-6 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <NeuralStats />
          </div>
        </section>

        {/* Dashboard */}
        <section className="px-4 sm:px-6 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrainActivityPanel />
            <DataStream />
          </div>
        </section>

        {/* Features */}
        <section className="px-4 sm:px-6 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-orbitron text-xl sm:text-2xl font-bold text-center mb-12">
              Advanced <span className="text-primary text-glow-cyan">Capabilities</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {[
                { icon: Shield, title: "Secure Mapping", desc: "End-to-end encrypted neural and genomic data with quantum-resistant protocols." },
                { icon: Zap, title: "Real-time Sync", desc: "Instant synaptic + DNA + cardiac cloning with sub-millisecond latency." },
                { icon: Layers, title: "Deep Learning", desc: "Multi-layer cognitive and cardiac architecture replication." },
                { icon: Dna, title: "DNA Profiling", desc: "Full genome sequencing from fingerprint epithelial cells in seconds." },
                { icon: Heart, title: "Cardiac Clone", desc: "4-chamber heart reconstruction from pulse wave analysis via touch." },
              ].map((f) => (
                <div key={f.title} className="p-4 sm:p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm hover:box-glow-cyan transition-all duration-300 group">
                  <f.icon className="w-6 sm:w-8 h-6 sm:h-8 text-primary mb-3 sm:mb-4 group-hover:text-secondary transition-colors" />
                  <h3 className="font-orbitron text-[11px] sm:text-sm font-bold mb-2">{f.title}</h3>
                  <p className="text-[11px] sm:text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 px-4 sm:px-6 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">© 2026 MegaMind Neural Systems</span>
            <span className="font-mono text-xs text-muted-foreground">v4.0.0-neural</span>
          </div>
        </footer>
      </div>

      {/* Chatbot */}
      <BrainChatbot visible={scanComplete} />
    </div>
  );
};

export default Index;
