import { useEffect, useState } from "react";
import { Activity, Brain, Cpu, Network } from "lucide-react";

const stats = [
  { icon: Brain, label: "Neural Pathways", value: 86400000, suffix: "", format: true },
  { icon: Activity, label: "Synaptic Activity", value: 99.7, suffix: "%", format: false },
  { icon: Cpu, label: "Processing Cores", value: 2048, suffix: "", format: true },
  { icon: Network, label: "Active Connections", value: 1200000, suffix: "", format: true },
];

const NeuralStats = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-700 hover:box-glow-cyan group ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${i * 150}ms` }}
        >
          <stat.icon className="w-5 h-5 text-primary mb-3 group-hover:text-secondary transition-colors" />
          <p className="font-orbitron text-xl text-foreground">
            {stat.format
              ? stat.value.toLocaleString()
              : stat.value}
            {stat.suffix}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {stat.label}
          </p>
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20 rounded-tr-lg" />
        </div>
      ))}
    </div>
  );
};

export default NeuralStats;
