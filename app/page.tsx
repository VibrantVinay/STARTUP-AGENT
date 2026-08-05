'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

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
/* 1. LANDING PAGE WITH REVOLVING GLOBE & FLOATING AVATARS           */
/* ================================================================= */
function LandingView({ onLaunch }: { onLaunch: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Globe Core (Dark Metallic Sphere with Latitude/Longitude wireframe grid)
    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Wireframe Overlay for High-Tech Aesthetic
    const wireframeGeometry = new THREE.SphereGeometry(2.02, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireframeGlobe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeGlobe);

    // Floating Orbiting User Avatars / Testimonial Cards
    const avatarCount = 6;
    const orbitingGroup = new THREE.Group();
    scene.add(orbitingGroup);

    const avatars: { mesh: THREE.Mesh; angle: number; speed: number; radius: number }[] = [];

    // Placeholder gradient canvas generator for user avatars
    const createAvatarTexture = (name: string, role: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.roundRect(0, 0, 256, 128, 20);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(name, 24, 50);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText(role, 24, 85);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const userProfiles = [
      { name: 'Sarah Jenkins', role: 'SaaS Founder', color: '#1e1b4b' },
      { name: 'Alex Rivera', role: 'AI Developer', color: '#31103f' },
      { name: 'David Chen', role: 'Venture Capitalist', color: '#064e3b' },
      { name: 'Elena Rostova', role: 'Fintech Lead', color: '#7c2d12' },
      { name: 'Marcus Vance', role: 'Product Architect', color: '#172554' },
      { name: 'Priya Sharma', role: 'AgriTech Innovator', color: '#365314' },
    ];

    userProfiles.forEach((profile, i) => {
      const texture = createAvatarTexture(profile.name, profile.role, profile.color);
      const cardGeo = new THREE.PlaneGeometry(1.4, 0.7);
      const cardMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);

      const angle = (i / avatarCount) * Math.PI * 2;
      const radius = 3.4 + Math.random() * 0.6;
      const heightOffset = (Math.random() - 0.5) * 2;

      cardMesh.position.set(Math.cos(angle) * radius, heightOffset, Math.sin(angle) * radius);
      orbitingGroup.add(cardMesh);

      avatars.push({
        mesh: cardMesh,
        angle: angle,
        speed: 0.003 + Math.random() * 0.002,
        radius: radius,
      });
    });

    // Mouse interactive rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Window resizing handler
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate central globe smoothly
      globe.rotation.y += 0.002;
      wireframeGlobe.rotation.y -= 0.001;

      // Orbit user avatars around the globe and face them outward toward camera
      avatars.forEach((avatar) => {
        avatar.angle += avatar.speed;
        avatar.mesh.position.x = Math.cos(avatar.angle) * avatar.radius;
        avatar.mesh.position.z = Math.sin(avatar.angle) * avatar.radius;
        avatar.mesh.lookAt(camera.position);
      });

      // Subtle mouse parallax tilt
      targetRotationX = THREE.MathUtils.lerp(targetRotationX, mouseY, 0.05);
      targetRotationY = THREE.MathUtils.lerp(targetRotationY, mouseX, 0.05);
      scene.rotation.x = targetRotationX;
      scene.rotation.y = targetRotationY;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between p-6 md:p-12">
      {/* Top Navigation */}
      <nav className="w-full max-w-7xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30">
            NV
          </div>
          <span className="font-semibold tracking-tight text-lg text-gray-200">
            NeuroValidate <span className="text-indigo-400 text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/50">v2.0</span>
          </span>
        </div>
        <button
          onClick={onLaunch}
          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-all backdrop-blur-md"
        >
          Open Console
        </button>
      </nav>

      {/* Hero Section Container */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-center gap-12 my-auto z-10 py-12">
        <div className="flex flex-col items-start text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Next-Gen AI Business Architect
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Validate Startups with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Global Intelligence</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
            Harness real-time web agents, multi-step market analysis, and advanced Groq neural pipelines to turn raw ideas into investor-ready business plans instantly.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onLaunch}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-white shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-3 group"
            >
              Launch Startup Agent
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Globe Interactive Container */}
        <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center">
          <div className="absolute inset-0 bg-radial from-indigo-600/15 via-transparent to-transparent pointer-events-none blur-3xl"></div>
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 border-t border-gray-800/60 pt-6 z-10">
        <p>© 2026 NeuroValidate AI. Engineered for elite founders.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="hover:text-gray-400 cursor-pointer">Privacy Protocol</span>
          <span className="hover:text-gray-400 cursor-pointer">API Docs</span>
          <span className="hover:text-gray-400 cursor-pointer">System Status</span>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================= */
/* 2. CHAT AGENT WORKSPACE VIEW                                     */
/* ================================================================= */
function ChatView({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('');
  const { messages, status, sendMessage, error } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#05050a] text-gray-100">
      {/* Workspace Header */}
      <header className="w-full border-b border-gray-800/80 bg-[#090911]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all flex items-center gap-2 text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Return to Globe
          </button>
          <div className="h-4 w-px bg-gray-800"></div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-sm tracking-tight text-gray-200">Startup Validator Agent Active</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono hidden md:block">
          Model: Llama-3.3-70b-versatile
        </div>
      </header>

      {/* Main Chat Feed Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6 pb-36">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center my-20 p-8 rounded-3xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 text-2xl font-bold">
              💡
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Ready for your startup concept</h3>
            <p className="text-sm text-gray-400 max-w-md">
              Type your business idea below. The agent will execute live market research, examine competitors, and build your complete strategy.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-6 rounded-2xl max-w-[90%] md:max-w-[85%] leading-relaxed ${
              m.role === 'user' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'bg-[#0e0e18] text-gray-200 border border-gray-800/80 shadow-xl'
            }`}>
              {m.parts?.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {part.text}
                    </div>
                  );
                }
                
                // Render tool execution states
                if (part.type === 'tool-searchWeb') {
                  const query = (part as any).input?.query || "market data";
                  if (part.state === 'output-available') {
                    return (
                      <div key={index} className="text-xs text-emerald-400 mt-4 pt-3 border-t border-gray-800 flex items-center gap-2">
                        <span>✓</span> Market analysis verified for: <strong>{query}</strong>
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="text-xs text-indigo-400 mt-4 pt-3 border-t border-gray-800 flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                        Scanning global web and market competitors for: <strong>{query}</strong>...
                      </div>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex flex-col items-center p-6 rounded-2xl bg-red-950/30 text-red-400 border border-red-900/50">
            <strong className="text-sm font-semibold">Execution Interrupted</strong>
            <span className="text-xs mt-1 text-center text-red-300">{error.message}</span>
          </div>
        )}
      </div>

      {/* Floating Input Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/90 to-transparent pb-6 pt-10 px-4 z-40">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center shadow-2xl rounded-2xl bg-[#0b0b14] border border-gray-800/80 focus-within:border-indigo-500 transition-all">
            <input
              className="w-full p-4 pl-6 pr-28 bg-transparent text-gray-100 placeholder-gray-500 text-sm md:text-base outline-none"
              value={input}
              placeholder="Describe your startup concept (e.g., AI logistics for supply chains)..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
