/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  BrainCircuit,
  Loader2,
  ChevronRight,
  School
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Prediction {
  prediction: string;
  confidence: number;
  raw_result: number;
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    attendance: 85,
    grades: 75,
    social_engagement: 7,
    stress_level: 4
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Normalize data for the model (0.0 - 1.0)
      const payload = {
        attendance: formData.attendance / 100,
        grades: formData.grades / 100,
        social_engagement: formData.social_engagement / 10,
        stress_level: formData.stress_level / 10
      };

      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to get prediction from model');
      
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <School className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">BehaviorInsights</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            <BrainCircuit className="w-4 h-4" />
            Random Forest Model v1.0
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 uppercase tracking-tighter">
                Student Behavior Analysis
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Enter recent metrics for a student to predict behavior trajectory and identify potential support needs early.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="space-y-4">
                <InputRange 
                  label="Class Attendance" 
                  name="attendance" 
                  value={formData.attendance} 
                  onChange={handleInputChange}
                  min={0} max={100} unit="%"
                  icon={<Users className="w-4 h-4" />}
                />
                
                <InputRange 
                  label="Average Grades" 
                  name="grades" 
                  value={formData.grades} 
                  onChange={handleInputChange}
                  min={0} max={100} unit="%"
                  icon={<BookOpen className="w-4 h-4" />}
                />

                <InputRange 
                  label="Social Engagement" 
                  name="social_engagement" 
                  value={formData.social_engagement} 
                  onChange={handleInputChange}
                  min={0} max={10} unit="/ 10"
                  icon={<Users className="w-4 h-4" />}
                />

                <InputRange 
                  label="Observed Stress Level" 
                  name="stress_level" 
                  value={formData.stress_level} 
                  onChange={handleInputChange}
                  min={0} max={10} unit="/ 10"
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Run Diagnostic Analysis
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Column: Results */}
          <div className="lg:sticky lg:top-12">
            <AnimatePresence mode="wait">
              {prediction ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-8 rounded-3xl border-4 ${
                    prediction.raw_result === 1 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    {prediction.raw_result === 1 ? (
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Analysis Result</h3>
                      <p className={`text-3xl font-black ${
                        prediction.raw_result === 1 ? 'text-red-700' : 'text-emerald-700'
                      }`}>
                        {prediction.prediction}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/50 p-6 rounded-2xl">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">Model Confidence</span>
                        <span className="text-2xl font-black text-slate-900">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${
                            prediction.raw_result === 1 ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {prediction.raw_result === 1 ? (
                        <div className="text-red-800 bg-red-100/50 p-4 rounded-xl text-sm italic">
                          "Recommendation: Targeted intervention and conversation with the student's counselor is advised."
                        </div>
                      ) : (
                        <div className="text-emerald-800 bg-emerald-100/50 p-4 rounded-xl text-sm italic">
                          "Status: Normal behavior levels observed. Continue regular monitoring program."
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <BrainCircuit className="w-16 h-16 text-slate-300" />
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg">Awaiting Input</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      Fill out the form on the left to run the behavior prediction model.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-900/5 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-100"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )
            }
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-200 mt-12 text-center">
        <p className="text-slate-400 text-sm">
          Scikit-Learn Random Forest Classifier Integration | Built for Behavioral Education
        </p>
      </footer>
    </div>
  );
}

function InputRange({ label, name, value, onChange, min, max, unit, icon }: { 
  label: string; 
  name: string; 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
          {value}{unit}
        </span>
      </div>
      <input 
        type="range" 
        name={name}
        min={min} 
        max={max} 
        value={value} 
        onChange={onChange}
        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );
}
