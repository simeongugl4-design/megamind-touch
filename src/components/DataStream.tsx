import { useEffect, useState } from "react";

const generateData = () =>
  Array.from({ length: 8 }, () => ({
    id: Math.random().toString(36).slice(2, 10),
    hex: Math.random().toString(16).slice(2, 10).toUpperCase(),
    type: ["SYN", "NEU", "AXN", "DEN", "MYE"][Math.floor(Math.random() * 5)],
  }));

const DataStream = () => {
  const [data, setData] = useState(generateData);

  useEffect(() => {
    const interval = setInterval(() => setData(generateData()), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <h3 className="font-orbitron text-sm tracking-widest uppercase text-secondary mb-4">
        Neural Data Stream
      </h3>
      <div className="space-y-1.5 font-mono text-xs overflow-hidden">
        {data.map((d, i) => (
          <div
            key={d.id + i}
            className="flex gap-3 text-muted-foreground animate-pulse"
            style={{ animationDelay: `${i * 200}ms`, animationDuration: "3s" }}
          >
            <span className="text-primary">[{d.type}]</span>
            <span>0x{d.hex}</span>
            <span className="text-secondary">{d.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataStream;
