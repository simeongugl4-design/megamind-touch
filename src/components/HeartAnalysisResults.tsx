import { useState, useEffect } from "react";
import {
  Heart, Activity, Gauge, Zap, Shield, TrendingUp,
  Thermometer, Droplets, Wind, Timer, AlertTriangle, CheckCircle
} from "lucide-react";

const cardiacMetrics = [
  { label: "Heart Rate", value: "72", unit: "BPM", icon: Heart, color: "text-red-400", gradient: "from-red-500 to-rose-500" },
  { label: "Ejection Fraction", value: "62", unit: "%", icon: Gauge, color: "text-red-300", gradient: "from-red-400 to-pink-500" },
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity, color: "text-red-400", gradient: "from-rose-500 to-red-500" },
  { label: "Cardiac Output", value: "5.2", unit: "L/min", icon: Droplets, color: "text-red-300", gradient: "from-pink-500 to-red-500" },
  { label: "Stroke Volume", value: "72", unit: "mL", icon: Zap, color: "text-red-400", gradient: "from-red-500 to-orange-500" },
  { label: "VO₂ Max", value: "42", unit: "mL/kg/min", icon: Wind, color: "text-red-300", gradient: "from-red-400 to-rose-400" },
];

const heartChambers = [
  { name: "Left Ventricle", function: "Systemic Pump", desc: "The strongest chamber, pumping oxygenated blood to the entire body through the aorta.", wall: "12mm", pressure: "120 mmHg", efficiency: 94, color: "hsl(0,80%,55%)" },
  { name: "Right Ventricle", function: "Pulmonary Pump", desc: "Pumps deoxygenated blood to the lungs via the pulmonary artery for gas exchange.", wall: "5mm", pressure: "25 mmHg", efficiency: 91, color: "hsl(350,70%,60%)" },
  { name: "Left Atrium", function: "Oxygenated Receiver", desc: "Receives oxygen-rich blood from the lungs via pulmonary veins.", wall: "3mm", pressure: "8 mmHg", efficiency: 88, color: "hsl(0,70%,65%)" },
  { name: "Right Atrium", function: "Venous Receiver", desc: "Collects deoxygenated blood from superior and inferior vena cava.", wall: "2mm", pressure: "5 mmHg", efficiency: 90, color: "hsl(340,65%,58%)" },
];

const valveHealth = [
  { name: "Mitral Valve", status: "Normal", regurgitation: "None", leaflets: "2", condition: "healthy" },
  { name: "Aortic Valve", status: "Normal", regurgitation: "None", leaflets: "3", condition: "healthy" },
  { name: "Tricuspid Valve", status: "Normal", regurgitation: "Trace", leaflets: "3", condition: "healthy" },
  { name: "Pulmonary Valve", status: "Normal", regurgitation: "None", leaflets: "3", condition: "healthy" },
];

const coronaryArteries = [
  { name: "Left Anterior Descending", blockage: "0%", flow: "Normal", risk: "low" },
  { name: "Right Coronary Artery", blockage: "2%", flow: "Normal", risk: "low" },
  { name: "Left Circumflex", blockage: "0%", flow: "Normal", risk: "low" },
  { name: "Left Main Coronary", blockage: "0%", flow: "Normal", risk: "low" },
];

const rhythmData = [
  { label: "PR Interval", value: "160ms", normal: "120-200ms", status: "normal" },
  { label: "QRS Duration", value: "88ms", normal: "80-120ms", status: "normal" },
  { label: "QT Interval", value: "380ms", normal: "350-450ms", status: "normal" },
  { label: "Heart Rhythm", value: "Sinus", normal: "Sinus", status: "normal" },
];

const liveVitals = [
  { label: "O₂ Saturation", value: 98, unit: "%" },
  { label: "Mean Arterial Pressure", value: 93, unit: "mmHg" },
  { label: "Heart Rate Variability", value: 62, unit: "ms" },
  { label: "Peripheral Resistance", value: 1100, unit: "dyn·s/cm⁵" },
  { label: "Cardiac Index", value: 2.8, unit: "L/min/m²" },
  { label: "Core Temperature", value: 37.0, unit: "°C" },
];

const HeartAnalysisResults = ({ visible }: { visible: boolean }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(liveVitals);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setAnimateIn(true), 200);
      return () => clearTimeout(t);
    } else { setAnimateIn(false); }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setLiveMetrics(prev => prev.map(m => ({
        ...m,
        value: +(m.value + (Math.random() - 0.5) * (m.value * 0.01)).toFixed(1),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-12 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className={`text-center transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/5 font-mono text-xs text-red-400 mb-4">
            <Heart className="w-3 h-3 animate-pulse" /> CARDIAC CLONE COMPLETE
          </div>
          <h2 className="font-orbitron text-2xl lg:text-4xl font-bold mb-3">
            Heart <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-pink-400">Analysis</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Complete cardiac structure and function analysis derived from pulse wave patterns in your fingerprint vasculature.
          </p>
        </div>

        {/* Cardiac Metrics */}
        <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {cardiacMetrics.map(m => (
            <div key={m.label} className="relative p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-center overflow-hidden group hover:border-red-500/50 transition-all duration-300">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${m.gradient}`} />
              <m.icon className={`w-7 h-7 ${m.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <p className="font-orbitron text-3xl font-bold text-foreground">
                {m.value}<span className="text-sm text-muted-foreground ml-1">{m.unit}</span>
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Live Cardiac Vitals */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-150 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-400">Real-Time Cardiac Vitals</h3>
            <span className="font-mono text-[10px] text-muted-foreground ml-auto">LIVE</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMetrics.map(m => (
              <div key={m.label} className="p-3 rounded-lg border border-border/50 bg-background/30">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-orbitron text-lg font-bold text-foreground">{m.value}</span>
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heart Chambers */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-400 mb-5">
            <Heart className="w-4 h-4 inline mr-2" />Chamber Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {heartChambers.map((c, i) => (
              <div key={c.name} className="p-4 rounded-lg border border-border/50 bg-background/30 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-orbitron text-xs font-bold text-foreground">{c.name}</span>
                  <span className="font-mono text-[10px] text-red-400 ml-auto">{c.function}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="font-mono text-[9px] text-muted-foreground">Wall</p><p className="font-orbitron text-xs font-bold text-foreground">{c.wall}</p></div>
                  <div><p className="font-mono text-[9px] text-muted-foreground">Pressure</p><p className="font-orbitron text-xs font-bold text-foreground">{c.pressure}</p></div>
                  <div><p className="font-mono text-[9px] text-muted-foreground">Efficiency</p><p className="font-orbitron text-xs font-bold text-foreground">{c.efficiency}%</p></div>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: animateIn ? `${c.efficiency}%` : "0%",
                      transitionDelay: `${i * 150 + 400}ms`,
                      backgroundColor: c.color,
                      boxShadow: `0 0 8px ${c.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Valve Health */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-300 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-300 mb-5">
            <Shield className="w-4 h-4 inline mr-2" />Valve Health
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {valveHealth.map(v => (
              <div key={v.name} className="p-3 rounded-lg border border-border/50 bg-background/30 text-center">
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="font-orbitron text-[11px] font-bold text-foreground">{v.name}</p>
                <p className="font-mono text-[10px] text-green-400 mt-1">{v.status}</p>
                <p className="font-mono text-[9px] text-muted-foreground">{v.leaflets} leaflets</p>
                <p className="font-mono text-[9px] text-muted-foreground">Regurg: {v.regurgitation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coronary Arteries */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-400 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-400 mb-5">
            <Activity className="w-4 h-4 inline mr-2" />Coronary Artery Assessment
          </h3>
          <div className="space-y-3">
            {coronaryArteries.map(a => (
              <div key={a.name} className="p-3 rounded-lg border border-border/50 bg-background/30 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron text-xs font-bold text-foreground">{a.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">Flow: {a.flow}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-orbitron text-sm font-bold text-green-400">{a.blockage}</p>
                  <p className="font-mono text-[8px] text-muted-foreground">BLOCKAGE</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ECG Rhythm */}
        <div className={`p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 delay-500 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-300 mb-5">
            <Timer className="w-4 h-4 inline mr-2" />ECG Rhythm Analysis
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {rhythmData.map(r => (
              <div key={r.label} className="p-3 rounded-lg border border-border/50 bg-background/30 text-center">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{r.label}</p>
                <p className="font-orbitron text-lg font-bold text-foreground">{r.value}</p>
                <p className="font-mono text-[9px] text-muted-foreground">Normal: {r.normal}</p>
                <CheckCircle className="w-3 h-3 text-green-400 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* How Heart is Cloned */}
        <div className={`p-6 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-pink-500/5 backdrop-blur-sm transition-all duration-700 delay-[600ms] ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-red-400 mb-4">
            <Heart className="w-4 h-4 inline mr-2" />How MegaMind Clones Your Heart Through Touch
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Pulse Wave Analysis", desc: "Your fingertip's arterial pulse wave contains a complete hemodynamic signature. MegaMind reads pulse wave velocity, augmentation index, and arterial stiffness from capillary blood flow patterns." },
              { step: "02", title: "Cardiac Reconstruction", desc: "Using photoplethysmography and impedance cardiography via the fingerprint sensor, we reconstruct chamber dimensions, wall thickness, valve function, and ejection fraction with clinical-grade precision." },
              { step: "03", title: "Digital Twin Assembly", desc: "AI models combine pulse wave data with genetic cardiovascular markers (SCN5A, MYH7, KCNQ1) to build a complete 4-chamber digital cardiac twin with real-time hemodynamic simulation." },
            ].map(s => (
              <div key={s.step} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center font-orbitron text-sm font-bold text-red-400">
                  {s.step}
                </div>
                <p className="font-orbitron text-xs font-bold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground italic">
          ⚠️ Cardiac analysis derived from pulse wave and genetic markers. Results are indicative and should not replace professional cardiological assessment.
        </p>
      </div>
    </section>
  );
};

export default HeartAnalysisResults;
