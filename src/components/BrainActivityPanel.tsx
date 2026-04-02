import { useEffect, useState } from "react";

const regions = [
  { name: "Prefrontal Cortex", activity: 87, color: "bg-primary" },
  { name: "Temporal Lobe", activity: 72, color: "bg-secondary" },
  { name: "Parietal Lobe", activity: 94, color: "bg-primary" },
  { name: "Occipital Lobe", activity: 65, color: "bg-secondary" },
  { name: "Cerebellum", activity: 81, color: "bg-primary" },
  { name: "Hippocampus", activity: 91, color: "bg-secondary" },
];

const BrainActivityPanel = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <h3 className="font-orbitron text-sm tracking-widest uppercase text-primary mb-6">
        Brain Region Activity
      </h3>
      <div className="space-y-4">
        {regions.map((region, i) => (
          <div key={region.name}>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs text-muted-foreground">{region.name}</span>
              <span className="font-mono text-xs text-foreground">{region.activity}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${region.color} transition-all duration-1000 ease-out`}
                style={{
                  width: animated ? `${region.activity}%` : "0%",
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrainActivityPanel;
