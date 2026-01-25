
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, TrendingUp, TrendingDown, RefreshCcw, Calculator } from 'lucide-react';

interface SimulationMetrics {
  aptitude: number;
  coding: number;
  soft_skills: number;
  project: number;
  attendance: number;
}

interface SimulationResult {
  original: {
    overall_score: number;
    placement_prob: number;
  };
  simulated: {
    overall_score: number;
    placement_prob: number;
    deltas: {
      overall_score: number;
      placement_prob: number;
    };
  };
}

export function PredictionSimulator() {
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    aptitude: 70,
    coding: 65,
    soft_skills: 60,
    project: 75,
    attendance: 80,
  });

  const [changes, setChanges] = useState<SimulationMetrics>({
    aptitude: 0,
    coding: 0,
    soft_skills: 0,
    project: 0,
    attendance: 0,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMetricChange = (key: keyof SimulationMetrics, value: number[]) => {
    setMetrics(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleChangeInput = (key: keyof SimulationMetrics, value: number[]) => {
    setChanges(prev => ({ ...prev, [key]: value[0] }));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/statistical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: metrics, changes: changes }),
      });
      
      if (!response.ok) throw new Error('Simulation failed');
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const MetricSlider = ({ label, field, min = 0, max = 100 }: { label: string, field: keyof SimulationMetrics, min?: number, max?: number }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-500">Current: {metrics[field]}</span>
           <Badge variant="outline" className={`${changes[field] > 0 ? 'text-emerald-400 border-emerald-500/30' : changes[field] < 0 ? 'text-rose-400 border-rose-500/30' : 'text-slate-400'}`}>
             {changes[field] > 0 ? '+' : ''}{changes[field]}
           </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
         {/* Base Value Display (Static for context vs Slider) */}
         {/* We actually want to adjust the CHANGE, not the base value directly in this mode, or maybe both? 
             Let's simplify: User defines 'Base' state first. Then uses 'Impact' sliders. 
             Actually, simpler: Just one set of sliders impacting the 'Simulated' state? 
             No, the user story is "What if I improve X by Y?".
             So let's have sliders for the "adjustment" (-20 to +20).
         */}
         <div className="col-span-3">
             <Slider 
                value={[changes[field]]} 
                min={-30} 
                max={30} 
                step={1} 
                onValueChange={(val) => handleChangeInput(field, val)} 
                className="py-2"
             />
         </div>
      </div>
    </div>
  );

  return (
    <Card className="border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-slate-100">Prediction Simulator</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Run "What-If" scenarios to see how performance improvements affect Overall Score and Placement Probability.
          <br/>
          <span className="text-xs text-slate-500 mt-1 inline-block">Engine: Python SciPy/NumPy Logic</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Controls */}
        <div className="space-y-6">
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-200">Adjust Variables</h3>
                    <Button variant="ghost" size="sm" onClick={() => setChanges({aptitude:0, coding:0, soft_skills:0, project:0, attendance:0})} className="h-6 text-xs text-slate-500 hover:text-indigo-400">
                        Reset
                    </Button>
                </div>
                
                <MetricSlider label="Coding" field="coding" />
                <MetricSlider label="Aptitude" field="aptitude" />
                <MetricSlider label="Soft Skills" field="soft_skills" />
                <MetricSlider label="Projects" field="project" />
                <MetricSlider label="Attendance" field="attendance" />
            </div>

            <Button onClick={runSimulation} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                Run Global Simulation
            </Button>
        </div>

        {/* Results */}
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Projected Outcomes</h3>
            
            {!result ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                    <Calculator className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Adjust variables and run simulation to see impact.</p>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Overall Score Card */}
                    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-16 h-16 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Overall Performance</p>
                            <div className="flex items-baseline mt-2 gap-3">
                                <span className="text-4xl font-bold text-white">{result.simulated.overall_score}</span>
                                <div className={`flex items-center text-sm font-bold ${result.simulated.deltas.overall_score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.simulated.deltas.overall_score >= 0 ? '+' : ''}{result.simulated.deltas.overall_score}
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                Previous: {result.original.overall_score}
                            </div>
                        </div>
                         {/* Progress Bar Visual */}
                         <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${result.simulated.overall_score}%` }}></div>
                         </div>
                    </div>

                    {/* Placement Probability Card */}
                    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowRight className="w-16 h-16 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Placement Probability</p>
                            <div className="flex items-baseline mt-2 gap-3">
                                <span className="text-4xl font-bold text-white">{result.simulated.placement_prob}%</span>
                                <div className={`flex items-center text-sm font-bold ${result.simulated.deltas.placement_prob >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.simulated.deltas.placement_prob >= 0 ? '+' : ''}{result.simulated.deltas.placement_prob}%
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                Logistic Regression Model
                            </div>
                        </div>
                        {/* Progress Bar Visual */}
                        <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${result.simulated.placement_prob}%` }}></div>
                        </div>
                    </div>

                    {/* Analysis Text */}
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                        <p className="text-sm text-emerald-200/80">
                            <span className="font-semibold text-emerald-400">Analysis:</span> 
                            {result.simulated.deltas.overall_score > 0 
                                ? " The proposed improvements successfully drive the overall score upwards. Focus on maintaining these habits."
                                : " No net positive change detected. Try optimizing high-weight areas like Coding (30%) or Attendance (10%)."}
                        </p>
                    </div>

                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
