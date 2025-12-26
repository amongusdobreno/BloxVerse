
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getStudioHelp } from '../services/geminiService';
import { Experience, Instance } from '../types';

interface Props {
  onCreate: (experience: Experience) => void;
  onTest: (experience: Experience) => void;
}

const Studio: React.FC<Props> = ({ onCreate, onTest }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'editor' | 'viewport' | 'ai'>('viewport');
  const [loading, setLoading] = useState(false);
  
  const [mTitle, setMTitle] = useState(() => localStorage.getItem('bv_title') || 'My Blox Project');
  const [mDesc, setMDesc] = useState(() => localStorage.getItem('bv_desc') || 'Created with BloxVerse Studio');
  
  const [hierarchy, setHierarchy] = useState<Instance[]>(() => {
    const saved = localStorage.getItem('bv_hierarchy');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'workspace', name: 'Workspace', type: 'folder', children: [] },
      { id: 'starterpack', name: 'StarterPack', type: 'folder', children: [] }
    ];
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('bv_hierarchy', JSON.stringify(hierarchy));
    localStorage.setItem('bv_title', mTitle);
    localStorage.setItem('bv_desc', mDesc);
  }, [hierarchy, mTitle, mDesc]);

  const findInstance = (list: Instance[], id: string): Instance | null => {
    for (const item of list) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findInstance(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateInstance = (list: Instance[], id: string, updates: Partial<Instance>): Instance[] => {
    return list.map(item => {
      if (item.id === id) return { ...item, ...updates };
      if (item.children) return { ...item, children: updateInstance(item.children, id, updates) };
      return item;
    });
  };

  const deleteInstance = (list: Instance[], id: string): Instance[] => {
    return list.filter(item => item.id !== id).map(item => ({
      ...item,
      children: item.children ? deleteInstance(item.children, id) : undefined
    }));
  };

  const addInstance = (parentId: string, type: Instance['type']) => {
    const id = type + '_' + Date.now();
    let newItem: Instance = { id, name: 'New_' + type, type, children: [] };
    
    if (type === 'part') {
      newItem.data = { position: [0, 5, 0], scale: [4, 4, 4], color: '#ffffff' };
    } else if (type === 'script' || type === 'localscript') {
      newItem.data = { content: '-- BloxVerse Script\nprint("Hello World")' };
    } else if (type === 'tool') {
      newItem.data = { icon: '🔧', name: 'New Tool' };
    } else if (type === 'gamepass') {
      newItem.data = { price: 100, description: 'GamePass Description', icon: '💎' };
    }
    
    setHierarchy(prev => updateInstance(prev, parentId, { 
      children: [...(findInstance(prev, parentId)?.children || []), newItem] 
    }));
    setSelectedId(id);
  };

  const renderExplorer = (items: Instance[], depth = 0) => {
    return items.map(item => (
      <div key={item.id} className="select-none">
        <div 
          onClick={() => setSelectedId(item.id)} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold transition-all ${selectedId === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <span>{item.type === 'folder' ? '📂' : item.type === 'part' ? '🧱' : item.type.includes('script') ? '📜' : item.type === 'gamepass' ? '💎' : '🔧'}</span>
          <span className="truncate">{item.name}</span>
        </div>
        {item.children && item.children.length > 0 && renderExplorer(item.children, depth + 1)}
      </div>
    ));
  };

  useEffect(() => {
    if (activeTab !== 'viewport' || !previewRef.current) return;
    const width = previewRef.current.clientWidth;
    const height = previewRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    previewRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.GridHelper(100, 20, 0x333333, 0x1a1a1a));

    const renderItems = (items: Instance[]) => {
      items.forEach(item => {
        if (item.type === 'part' && item.data) {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ 
            color: item.data.color,
            wireframe: selectedId === item.id 
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.scale.set(item.data.scale[0], item.data.scale[1], item.data.scale[2]);
          mesh.position.set(item.data.position[0], item.data.position[1], item.data.position[2]);
          scene.add(mesh);
        }
        if (item.children) renderItems(item.children);
      });
    };
    renderItems(hierarchy);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      return () => cancelAnimationFrame(frameId);
    };
    animate();

    return () => {
      renderer.dispose();
      previewRef.current?.removeChild(renderer.domElement);
    };
  }, [activeTab, hierarchy, selectedId]);

  const selectedInstance = findInstance(hierarchy, selectedId || '');

  const askAi = async () => {
    if (!aiQuery || loading) return;
    setLoading(true);
    const q = aiQuery; 
    setAiQuery('');
    setAiHistory(p => [...p, {role: 'user', text: q}]);
    try {
      const res = await getStudioHelp(q);
      setAiHistory(p => [...p, {role: 'ai', text: res}]);
    } catch {
      setAiHistory(p => [...p, {role: 'ai', text: "Erro ao conectar com a IA."}]);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (key: string, axisIndex: number, val: number) => {
    if (!selectedInstance || !selectedInstance.data) return;
    const newData = { ...selectedInstance.data };
    newData[key] = [...newData[key]];
    newData[key][axisIndex] = val;
    setHierarchy(prev => updateInstance(prev, selectedId!, { data: newData }));
  };

  return (
    <div className="h-full flex flex-col bg-[#111] rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
      {/* TOOLBAR */}
      <div className="h-16 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 p-2 rounded-lg font-black text-white text-xs italic">S</div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('viewport')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'viewport' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Viewport</button>
            <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'editor' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Script</button>
            <button onClick={() => setActiveTab('info')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'info' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Info</button>
            <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeTab === 'ai' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-blue-400'}`}>BloxAI</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onTest({ id: 'test', title: mTitle, creator: 'Developer', thumbnail: '', rating: 100, players: 0, category: 'Custom', description: mDesc, hierarchy })} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Play Test</button>
          <button onClick={() => onCreate({ id: 'game_'+Date.now(), title: mTitle, creator: 'Developer', thumbnail: 'https://picsum.photos/seed/studio/800/450', rating: 0, players: 0, category: 'Custom', description: mDesc, hierarchy })} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Publish</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* EXPLORER */}
        <aside className="w-64 bg-[#161616] border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Explorer</div>
          <div className="flex-1 overflow-y-auto p-2">{renderExplorer(hierarchy)}</div>
          <div className="p-4 border-t border-white/5 grid grid-cols-2 gap-2">
            <button onClick={() => addInstance(selectedId || 'workspace', 'part')} className="p-2 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black text-gray-400 uppercase">+ Part</button>
            <button onClick={() => addInstance(selectedId || 'workspace', 'folder')} className="p-2 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black text-gray-400 uppercase">+ Folder</button>
            <button onClick={() => addInstance(selectedId || 'workspace', 'script')} className="p-2 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black text-gray-400 uppercase">+ Script</button>
            <button onClick={() => addInstance(selectedId || 'workspace', 'localscript')} className="p-2 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black text-gray-400 uppercase">+ Local</button>
            <button onClick={() => addInstance(selectedId || 'workspace', 'tool')} className="p-2 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black text-gray-400 uppercase">+ Tool</button>
            <button onClick={() => addInstance(selectedId || 'workspace', 'gamepass')} className="p-2 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black text-gray-400 uppercase">+ Gamepass</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 relative bg-[#0a0a0a]">
          {activeTab === 'viewport' && <div ref={previewRef} className="w-full h-full" />}
          {activeTab === 'editor' && (
            <div className="w-full h-full p-8 font-mono text-sm text-green-400 bg-[#0a0a0a] overflow-auto">
              {selectedInstance?.type.includes('script') ? (
                <textarea className="w-full h-full bg-transparent outline-none resize-none" value={selectedInstance.data?.content || ''} onChange={(e) => setHierarchy(prev => updateInstance(prev, selectedId!, { data: { ...selectedInstance.data, content: e.target.value } }))} />
              ) : <div className="flex items-center justify-center h-full text-gray-600 uppercase font-black text-xs">Select a script to edit</div>}
            </div>
          )}
          {activeTab === 'info' && (
            <div className="h-full w-full bg-[#111] overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-[25px] flex items-center justify-center text-4xl shadow-2xl">📋</div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Experience Settings</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Configure your game details</p>
                  </div>
                </div>

                <div className="grid gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Project Title</label>
                    <input 
                      value={mTitle} 
                      onChange={e => setMTitle(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold text-sm outline-none focus:border-blue-600 focus:bg-white/10 transition-all shadow-xl" 
                      placeholder="My Epic Game..."
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Public Description</label>
                    <textarea 
                      value={mDesc} 
                      onChange={e => setMDesc(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold text-sm h-48 outline-none resize-none focus:border-blue-600 focus:bg-white/10 transition-all shadow-xl" 
                      placeholder="Describe your adventure here..."
                    />
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[35px] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🌍</span>
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Global Publication Ready</span>
                  </div>
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'ai' && (
            <div className="flex flex-col h-full bg-[#0a0a0a]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiHistory.map((h, i) => (
                  <div key={i} className={`p-4 rounded-2xl max-w-[80%] ${h.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-white/5 border border-white/10 mr-auto'}`}>
                    <div className="text-xs text-white whitespace-pre-wrap">{h.text}</div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/5 flex gap-4">
                <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAi()} placeholder="Ask BloxAI for help..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 text-xs text-white" />
                <button onClick={askAi} disabled={loading} className="bg-blue-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase text-white">{loading ? '...' : 'Send'}</button>
              </div>
            </div>
          )}
        </main>

        {/* PROPERTIES */}
        <aside className="w-72 bg-[#161616] border-l border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Properties</div>
          <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
            {selectedInstance ? (
              <>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-600">Name</label>
                  <input value={selectedInstance.name} onChange={e => setHierarchy(prev => updateInstance(prev, selectedId!, { name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-blue-600" />
                </div>
                {selectedInstance.type === 'part' && selectedInstance.data && (
                  <>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-600">Position (X, Y, Z)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map(i => (
                          <input key={i} type="number" value={selectedInstance.data.position[i]} onChange={e => handleDataChange('position', i, parseFloat(e.target.value))} className="bg-white/5 border border-white/10 p-2 text-[9px] text-white rounded outline-none" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-600">Scale (X, Y, Z)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map(i => (
                          <input key={i} type="number" value={selectedInstance.data.scale[i]} onChange={e => handleDataChange('scale', i, parseFloat(e.target.value))} className="bg-white/5 border border-white/10 p-2 text-[9px] text-white rounded outline-none" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-600">Color</label>
                      <input type="color" value={selectedInstance.data.color} onChange={e => setHierarchy(prev => updateInstance(prev, selectedId!, { data: { ...selectedInstance.data, color: e.target.value } }))} className="w-full h-10 bg-transparent border-none block cursor-pointer" />
                    </div>
                  </>
                )}
                <button onClick={() => { setHierarchy(prev => deleteInstance(prev, selectedId!)); setSelectedId(null); }} className="w-full py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded text-[9px] font-black uppercase transition-all mt-4">Delete Object</button>
              </>
            ) : <div className="text-center text-gray-600 py-20 text-[10px] font-black uppercase">Nothing Selected</div>}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Studio;
