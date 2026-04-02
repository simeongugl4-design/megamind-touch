import { useState } from "react";
import megamindLogo from "@/assets/megamind-logo.png";
import neuralBg from "@/assets/neural-bg.jpg";
import FingerprintScanner from "@/components/FingerprintScanner";
import NeuralStats from "@/components/NeuralStats";
import BrainActivityPanel from "@/components/BrainActivityPanel";
import DataStream from "@/components/DataStream";
import NeuralBrain3D from "@/components/NeuralBrain3D";
import BrainAnalysisResults from "@/components/BrainAnalysisResults";
import { Shield, Zap, Layers } from "lucide-react";

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
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src={megamindLogo} alt="MegaMind" width={40} height={40} />
            <span className="font-orbitron text-lg font-bold tracking-wider text-foreground">
              MEGA<span className="text-primary text-glow-cyan">MIND</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition-colors">Neural Scan</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Brain Map</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Analytics</span>
          </div>
          <div className="px-4 py-2 rounded border border-primary/30 font-orbitron text-xs text-primary hover:bg-primary/10 cursor-pointer transition-colors">
            CONNECT
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 font-mono text-xs text-primary">
                <Zap className="w-3 h-3" /> NEURAL INTERFACE v4.0
              </div>
              <h1 className="font-orbitron text-4xl lg:text-6xl font-bold leading-tight">
                Clone Your{" "}
                <span className="text-primary text-glow-cyan">Brain</span>
                <br />
                Through Touch
              </h1>
              <p className="text-muted-foreground max-w-lg leading-relaxed">
                MegaMind reads neural patterns through fingerprint contact, mapping synaptic
                pathways and creating a digital clone of your cognitive architecture.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="px-6 py-3 rounded bg-gradient-neural font-orbitron text-xs font-bold tracking-widest uppercase text-primary-foreground hover:opacity-90 transition-opacity">
                  Start Scan
                </button>
                <button className="px-6 py-3 rounded border border-border font-orbitron text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <FingerprintScanner onScanningChange={setIsScanning} />
            </div>
          </div>
        </section>

        {/* 3D Neural Brain */}
        <section className="px-6 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <NeuralBrain3D scanning={isScanning} />
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <NeuralStats />
          </div>
        </section>

        {/* Dashboard */}
        <section className="px-6 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
            <BrainActivityPanel />
            <DataStream />
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-orbitron text-2xl font-bold text-center mb-12">
              Advanced <span className="text-primary text-glow-cyan">Capabilities</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Secure Mapping", desc: "End-to-end encrypted neural data with quantum-resistant protocols." },
                { icon: Zap, title: "Real-time Sync", desc: "Instant synaptic cloning with sub-millisecond latency." },
                { icon: Layers, title: "Deep Learning", desc: "Multi-layer cognitive architecture replication and enhancement." },
              ].map((f) => (
                <div key={f.title} className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm hover:box-glow-cyan transition-all duration-300 group">
                  <f.icon className="w-8 h-8 text-primary mb-4 group-hover:text-secondary transition-colors" />
                  <h3 className="font-orbitron text-sm font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 px-6 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">© 2026 MegaMind Neural Systems</span>
            <span className="font-mono text-xs text-muted-foreground">v4.0.0-neural</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
