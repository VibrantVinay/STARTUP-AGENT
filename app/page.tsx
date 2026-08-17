'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Settings2, X, BarChart3, PieChart as PieIcon, Activity, Radar as RadarIcon, Layers } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');

  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
      {view === 'landing' ? (
        <LandingView onLaunch={() => setView('chat')} />
      ) : (
        <ChatView onBack={() => setView('landing')} />
      )}
    </main>
  );
}

/* ================================================================= */
/* 1. LANDING PAGE WITH REVOLVING GLOBE                              */
/* ================================================================= */
function LandingView({ onLaunch }: { onLaunch: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const wireframeGeometry = new THREE.SphereGeometry(2.02, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x4f46e5, wireframe: true, transparent: true, opacity: 0.15 });
    const wireframeGlobe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeGlobe);

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      wireframeGlobe.rotation.y -= 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between p-6 md:p-12">
      <nav className="w-full max-w-7xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30">NV</div>
          <span className="font-semibold tracking-tight text-lg text-gray-200">NeuroValidate <span className="text-indigo-400 text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/50">v2.0</span></span>
        </div>
      </nav>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-center gap-12 my-auto z-10 py-12">
        <div className="flex flex-col items-start text-left space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Validate Startups with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Global Intelligence</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
            Harness real-time web agents, multi-step market analysis, and advanced neural pipelines to turn raw ideas into investor-ready business plans instantly.
          </p>
          <button onClick={onLaunch} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-white shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-3">
            Launch Neurovalidate Agent
          </button>
        </div>
        <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center">
          <div ref={mountRef} className="w-full h-full"></div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================= */
/* 2. CHAT AGENT WORKSPACE VIEW                                      */
/* ================================================================= */
function ChatView({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('');
  const [showBI, setShowBI] = useState(false);
  const { messages, status, sendMessage, error } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Extract the JSON data from the latest AI message
  // Extract the JSON data from the latest AI message
  const extractDashboardData = () => {
    let latestData = {
      riskData: [
        { subject: 'Market Saturation', A: 85, severity: 'high' },
        { subject: 'CapEx Needs', A: 65, severity: 'medium' },
        { subject: 'Regulatory', A: 90, severity: 'high' },
        { subject: 'Tech Debt', A: 40, severity: 'low' },
        { subject: 'Customer ACQ', A: 75, severity: 'medium' },
        { subject: 'Supply Chain', A: 50, severity: 'low' },
      ],
      timelineData: [
        { month: 'M1', riskLevel: 80, cashBurn: 40000 },
        { month: 'M3', riskLevel: 65, cashBurn: 35000 },
        { month: 'M6', riskLevel: 50, cashBurn: 20000 },
        { month: 'M9', riskLevel: 45, cashBurn: 15000 },
        { month: 'M12', riskLevel: 30, cashBurn: 10000 },
      ]
    };

    // Look for the last assistant message containing <dashboard_data>
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant') {
        // Updated line below to fix the TypeScript 'UIMessage' error
        const text = m.parts?.map((p: any) => p.text).join('') || (m as any).content || '';
        const match = text.match(/<dashboard_data>([\s\S]*?)<\/dashboard_data>/);
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1].trim());
            if (parsed.riskData && parsed.timelineData) {
              latestData = parsed;
              break;
            }
          } catch (e) {
            console.error("Failed to parse dynamic dashboard data", e);
          }
        }
      }
    }
    return latestData;
  };
  const dynamicDashboardData = extractDashboardData();

  // Remove the <dashboard_data> block from the visible chat output
  const cleanMessage = (text: string) => {
    return text.replace(/<dashboard_data>[\s\S]*?<\/dashboard_data>/g, '').trim();
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#05050a] text-gray-100 relative">
      <header className="w-full border-b border-gray-800/80 bg-[#090911]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all text-xs font-medium">
            ← Return
          </button>
          <div className="h-4 w-px bg-gray-800"></div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-sm text-gray-200">Agent Active</span>
          </div>
        </div>
        <button 
          onClick={() => setShowBI(true)}
          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <Activity size={16} />
          Open Risk BI Dashboard
        </button>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6 pb-36">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center my-10 p-8 rounded-3xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 text-2xl font-bold">
              💡
            </div>
            <p className="text-gray-300 md:text-lg max-w-3xl leading-relaxed text-justify mb-4">
              The <strong className="text-indigo-400">Neurovalidate Validator Agent</strong> is an interactive AI tool designed to help entrepreneurs test their new business ideas. Just type in your basic concept, and the agent acts as an objective sounding board analyzing the market, scoping out competitors, and pointing out potential blind spots. 
            </p>
            <p className="text-gray-400 max-w-3xl leading-relaxed text-justify">
              We don't need to have everything figured out at once as our idea evolves, we can easily drop in new details about our target audience, revenue model, or marketing strategy, and the agent will automatically weave them together into a clear, actionable business roadmap. Finally, risk factors and constraints can be analyzed in our interactive BI interface.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-6 rounded-2xl max-w-[90%] md:max-w-[85%] leading-relaxed ${
              m.role === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-[#0e0e18] text-gray-200 border border-gray-800/80 shadow-xl'
            }`}>
              {m.parts?.map((part, index) => {
                if (part.type === 'text') {
                  const visibleText = cleanMessage(part.text);
                  if (!visibleText) return null;
                  return <div key={index} className="whitespace-pre-wrap text-sm md:text-base">{visibleText}</div>;
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/90 to-transparent pb-6 pt-10 px-4 z-30">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center shadow-2xl rounded-2xl bg-[#0b0b14] border border-gray-800/80 focus-within:border-indigo-500 transition-all">
            <input
              className="w-full p-4 pl-6 pr-28 bg-transparent text-gray-100 placeholder-gray-500 outline-none"
              value={input}
              placeholder="Describe your startup concept here..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl disabled:opacity-40 transition-all">
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>
      </div>

      {/* BI DASHBOARD OVERLAY */}
      {showBI && <BIDashboardOverlay onClose={() => setShowBI(false)} data={dynamicDashboardData} />}
    </div>
  );
}

/* ================================================================= */
/* 3. POWER-BI / TABLEAU STYLE RISK DASHBOARD OVERLAY                */
/* ================================================================= */
function BIDashboardOverlay({ onClose, data }: { onClose: () => void, data: any }) {
  const [activeChart, setActiveChart] = useState('radar');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Load the dynamic data generated by the agent
  const riskData = data.riskData.filter((d: any) => filterSeverity === 'all' ? true : d.severity === filterSeverity);
  const timelineData = data.timelineData;

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-7xl bg-[#0a0a12] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Dashboard Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-[#0d0d16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-gray-100">Risk & Constraints Analytics BI</h2>
              <p className="text-xs text-gray-500">Analysis and details of your user-submitted startup idea</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Dashboard Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Controls (Tableau/PowerBI Style) */}
          <div className="w-64 border-r border-gray-800 bg-[#0a0a12] p-4 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings2 size={14} /> Refine Parameters
              </h3>
              <div className="space-y-2">
                <label className="text-sm text-gray-300 block">Risk Severity</label>
                <select 
                  className="w-full bg-[#13131f] border border-gray-700 rounded-lg p-2 text-sm text-gray-200 outline-none focus:border-indigo-500"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <option value="all">All Risks</option>
                  <option value="high">High Severity Only</option>
                  <option value="medium">Medium Severity</option>
                  <option value="low">Low Severity</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers size={14} /> Visualization Type (12+)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveChart('radar')} className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 ${activeChart === 'radar' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                  <RadarIcon size={16} /> Radar
                </button>
                <button onClick={() => setActiveChart('bar')} className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 ${activeChart === 'bar' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                  <BarChart3 size={16} /> Column
                </button>
                <button onClick={() => setActiveChart('pie')} className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 ${activeChart === 'pie' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                  <PieIcon size={16} /> Donut
                </button>
                <button onClick={() => setActiveChart('area')} className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 ${activeChart === 'area' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                  <Activity size={16} /> Area
                </button>
                <button className="p-2 rounded-lg border border-gray-800 text-gray-600 text-xs flex flex-col items-center gap-1 cursor-not-allowed" title="Scatter (Pro)">
                  Scatter
                </button>
                <button className="p-2 rounded-lg border border-gray-800 text-gray-600 text-xs flex flex-col items-center gap-1 cursor-not-allowed" title="Treemap (Pro)">
                  Treemap
                </button>
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="flex-1 p-6 bg-[#05050a] flex flex-col gap-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
              
              {/* Primary Selected Chart */}
              <div className="bg-[#0c0c14] border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Primary Selected Chart</h4>
                <p className="text-xs text-gray-500 mb-4">Live agent analysis populated for risk factors</p>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'radar' ? (
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" />
                        <Radar name="Risk Level" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                      </RadarChart>
                    ) : activeChart === 'bar' ? (
                      <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                        <Tooltip cursor={{ fill: '#1a1a2e' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                        <Bar dataKey="A" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : activeChart === 'pie' ? (
                      <PieChart>
                        <Pie data={riskData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="A">
                          {riskData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                      </PieChart>
                    ) : (
                      <AreaChart data={timelineData}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="month" tick={{ fill: '#888' }} />
                        <YAxis tick={{ fill: '#888' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                        <Area type="monotone" dataKey="riskLevel" stroke="#ec4899" fillOpacity={1} fill="url(#colorRisk)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secondary Fixed Chart (Timeline/Financials) */}
              <div className="bg-[#0c0c14] border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Risk Decay vs Cash Burn Timeline</h4>
                <p className="text-xs text-gray-500 mb-4">Data tracked by live agent analysis</p>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="riskLevel" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6' }} name="Risk Index" />
                      <Line yAxisId="right" type="monotone" dataKey="cashBurn" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="Est. Burn ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
