
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ExperienceCard from './components/ExperienceCard';
import AvatarEditor from './components/AvatarEditor';
import Studio from './components/Studio';
import GamePlay from './components/GamePlay';
import Marketplace from './components/Marketplace';
import FriendList from './components/FriendList';
import { Page, User, Experience, GamePass, SkinItem, Friend } from './types';
import { INITIAL_EXPERIENCES, SKIN_SHOP_ITEMS, INITIAL_FRIENDS, BovuxIcon } from './constants.tsx';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Home');
  const [experiences, setExperiences] = useState<Experience[]>(() => {
    const savedExps = localStorage.getItem('bloxverse_community_games');
    if (savedExps) return [...INITIAL_EXPERIENCES, ...JSON.parse(savedExps)];
    return INITIAL_EXPERIENCES;
  });
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [testExperience, setTestExperience] = useState<Experience | null>(null);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formEmail, setFormEmail] = useState('');
  const [formPass, setFormPass] = useState('');
  const [formName, setFormName] = useState('');

  const [accounts, setAccounts] = useState<User[]>(() => {
    const saved = localStorage.getItem('bloxverse_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('bloxverse_active_user');
    if (saved) {
      setIsLogged(true);
      setShowLogin(false);
      return JSON.parse(saved);
    }
    return {
      username: 'Guest',
      displayName: 'Guest Player',
      email: '',
      robux: 1000,
      role: 'Player',
      inventory: ['face_smile', 'skin_white', 'shirt_blue'],
      friends: INITIAL_FRIENDS,
      avatarConfig: {
        skinColor: '#FFE0BD',
        headShape: 'square',
        face: '😊',
        shirtColor: '#3b82f6',
        pantsColor: '#1e293b',
        accessory: 'none'
      }
    };
  });

  useEffect(() => {
    if (isLogged) {
      localStorage.setItem('bloxverse_active_user', JSON.stringify(user));
      const updatedAccounts = accounts.map(a => a.email === user.email ? user : a);
      if (!updatedAccounts.find(a => a.email === user.email)) updatedAccounts.push(user);
      setAccounts(updatedAccounts);
    }
  }, [user, isLogged]);

  useEffect(() => {
    localStorage.setItem('bloxverse_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isAdmin = formName === 'BrenoDEV' && formEmail === 'amongusdobreno@gmail.com' && formPass === 'DEVGAME';
    const exists = accounts.find(a => a.email === formEmail);
    
    if (exists) {
      if (isAdmin) {
        const adminAccount: User = {
          ...exists,
          displayName: 'BrenoDEV',
          role: 'OVERLORD DEV',
          robux: 9999999,
        };
        setUser(adminAccount);
      } else {
        setUser(exists);
      }
    } else {
      const newUser: User = {
        username: formName.toLowerCase().replace(/\s/g, '_'),
        displayName: formName || 'Player',
        email: formEmail,
        password: formPass,
        role: isAdmin ? 'OVERLORD DEV' : 'Player',
        robux: isAdmin ? 9999999 : 1000,
        inventory: ['face_smile', 'skin_white', 'shirt_blue'],
        friends: [],
        avatarConfig: { 
          skinColor: '#FFE0BD', 
          headShape: 'square', 
          face: '😊', 
          shirtColor: '#3b82f6', 
          pantsColor: '#1e293b', 
          accessory: 'none' 
        }
      };
      setUser(newUser);
    }
    setIsLogged(true);
    setShowLogin(false);
  };

  const handleBuyItem = (item: SkinItem | GamePass) => {
    if (user.inventory.includes(item.id)) {
      alert('You already own this item!');
      return;
    }
    if (user.robux < item.price) {
      alert('Not enough Robux!');
      return;
    }
    setUser(prev => ({
      ...prev,
      robux: prev.robux - item.price,
      inventory: [...prev.inventory, item.id]
    }));
  };

  const renderContent = () => {
    if (activePage === 'Discover') return (
      <div className="space-y-12 animate-in fade-in pb-20">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-black">Experiences</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10">
          {experiences.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())).map(exp => (
            <ExperienceCard key={exp.id} experience={exp} onPlay={() => setSelectedExp(exp)} />
          ))}
        </div>
      </div>
    );
    if (activePage === 'Avatar') return <AvatarEditor user={user} onUpdate={(c) => setUser(p => ({...p, avatarConfig: c}))} onBuy={handleBuyItem} onApply={() => {}} />;
    if (activePage === 'Friends') return <FriendList user={user} onJoin={(f) => {
      const exp = experiences.find(e => e.title === f.playing);
      if (exp) { setPlayingId(exp.id); setActivePage('Playing'); }
    }} onAddFriend={() => {
        const prefixes = ['Cool', 'Super', 'Epic', 'Mega', 'Shadow'];
        const suffixes = ['Ninja', 'Builder', 'Gamer', 'Warrior', 'Pro'];
        const randomName = prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)] + Math.floor(Math.random() * 99);
        const newFriend: Friend = { id: 'f_' + Date.now(), displayName: randomName, username: randomName.toLowerCase(), status: Math.random() > 0.5 ? 'Online' : 'In Game', avatar: '👤', playing: Math.random() > 0.5 ? experiences[0].title : undefined };
        setUser(prev => ({ ...prev, friends: [...prev.friends, newFriend] }));
    }} onRemoveFriend={(id) => setUser(p => ({...p, friends: p.friends.filter(f => f.id !== id)}))} />;
    if (activePage === 'Create') return <Studio onCreate={(exp) => {setExperiences([exp, ...experiences]); setActivePage('Home');}} onTest={(exp) => { setTestExperience(exp); setActivePage('Playing'); }} />;
    if (activePage === 'Market') return <Marketplace user={user} experiences={experiences} onBuyItem={handleBuyItem} />;
    
    if (activePage === 'Playing') {
      const currentExp = testExperience || experiences.find(e => e.id === playingId);
      return currentExp ? <GamePlay 
        experience={currentExp} 
        user={user} 
        onPointCollect={() => {}}
        onExit={() => { setPlayingId(null); setTestExperience(null); setActivePage('Home'); }} 
        onRate={() => {}}
      /> : null;
    }

    return (
      <div className="space-y-16 pb-20">
        <div className="bg-black rounded-[60px] p-20 text-white shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
             <h1 className="text-8xl font-black italic mb-2 uppercase tracking-tighter leading-none">Hello, {user.displayName}</h1>
             <div className="flex gap-8 mt-12">
                <div className="bg-white/10 px-8 py-6 rounded-[30px] border border-white/10 backdrop-blur-md">
                   <span className="text-3xl font-black text-yellow-400">{user.robux >= 9999999 ? '∞' : user.robux.toLocaleString()} Robux</span>
                </div>
                <div className="bg-white/10 px-8 py-6 rounded-[30px] border border-white/10 backdrop-blur-md">
                   <span className="text-3xl font-black text-blue-400 uppercase tracking-widest">{user.role}</span>
                </div>
             </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-10 text-[300px] font-black italic select-none pointer-events-none uppercase">BLOX</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2">
            <h2 className="text-4xl font-black italic uppercase text-black mb-10 tracking-tighter underline decoration-blue-500 underline-offset-8">Featured For You</h2>
            <div className="grid grid-cols-2 gap-10">
              {experiences.slice(0, 4).map(exp => (
                <ExperienceCard key={exp.id} experience={exp} onPlay={() => setSelectedExp(exp)} />
              ))}
            </div>
          </section>

          <aside className="space-y-8">
            <h2 className="text-4xl font-black italic uppercase text-black mb-10 tracking-tighter underline decoration-yellow-500 underline-offset-8">Lead Developer</h2>
            <div className="bg-white rounded-[50px] p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-yellow-400 to-green-600" />
              <div className="w-32 h-32 bg-black rounded-[40px] flex items-center justify-center text-5xl font-black text-white italic mb-6 shadow-xl group-hover:rotate-12 transition-all">B</div>
              <h3 className="text-2xl font-black uppercase text-black tracking-tighter leading-tight">Breno A. Fernandes M.</h3>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2 mb-8 flex items-center gap-2">
                <span>🇧🇷</span> Brasil • Lead Architect
              </p>
              
              <div className="w-full space-y-3">
                <a href="https://www.tiktok.com/@carteira.de.trabalho.clt" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-[#000000] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                  <span className="text-lg">🎵</span> TikTok
                </a>
                <a href="https://www.youtube.com/@AmongusDobreno" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-[#FF0000] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                  <span className="text-lg">📺</span> YouTube
                </a>
                <a href="https://github.com/amongusdobreno" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-[#24292e] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                  <span className="text-lg">🐙</span> GitHub
                </a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100 w-full">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.3em]">Built with BloxVerse Studio v3.1</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F2F4F5]">
      <Layout user={user} activePage={activePage} setActivePage={setActivePage} onSearch={setSearchQuery} onLoginClick={() => setShowLogin(true)}>
        {renderContent()}
      </Layout>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
          <div className="bg-white rounded-[60px] w-full max-w-xl p-16 relative shadow-2xl text-center border border-gray-100">
             <div className="w-20 h-20 bg-black rounded-3xl mx-auto mb-8 flex items-center justify-center font-black text-white text-3xl italic">B</div>
             <h3 className="text-4xl font-black uppercase text-black mb-10 italic tracking-tighter">Enter BloxVerse</h3>
             
             <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-4 text-gray-400">DisplayName</label>
                  <input type="text" placeholder="Enter your name" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-[25px] p-6 font-black outline-none focus:border-black transition-all" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-4 text-gray-400">Email</label>
                  <input type="email" placeholder="Enter your email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-[25px] p-6 font-black outline-none focus:border-black transition-all" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-4 text-gray-400">Password</label>
                  <input type="password" placeholder="••••••••" value={formPass} onChange={e => setFormPass(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-[25px] p-6 font-black outline-none focus:border-black transition-all" required />
                </div>
                <button className="w-full bg-black py-7 rounded-[30px] text-white font-black uppercase tracking-widest text-sm shadow-xl mt-8 hover:scale-105 transition-all active:scale-95">Connect Profile</button>
             </form>
          </div>
        </div>
      )}

      {selectedExp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
           <div className="bg-white rounded-[70px] w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl animate-in zoom-in">
              <div className="relative h-96 shrink-0">
                <img src={selectedExp.thumbnail || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&q=80'} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedExp(null)} className="absolute top-10 right-10 w-16 h-16 bg-black/50 backdrop-blur-lg text-white rounded-full flex items-center justify-center font-black text-2xl hover:bg-black transition-all">✕</button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-12 left-16"> 
                   <div className="flex gap-4 items-center mb-4">
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedExp.category}</span>
                      <span className="text-white/60 font-bold text-xs uppercase">by {selectedExp.creator}</span>
                   </div>
                   <h2 className="text-7xl font-black italic uppercase text-white tracking-tighter leading-none">{selectedExp.title}</h2> 
                </div>
              </div>
              <div className="p-16 space-y-12 overflow-y-auto custom-scrollbar flex-1 bg-white">
                 <div className="flex gap-20">
                    <div className="flex-1 space-y-8">
                       <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">About Experience</h4>
                       <p className="text-black text-xl font-medium leading-relaxed opacity-80">{selectedExp.description}</p>
                    </div>
                    <div className="w-72 space-y-6">
                       <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Rating</span>
                          <span className="text-green-600 font-black">{selectedExp.rating}%</span>
                       </div>
                       <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Active</span>
                          <span className="text-black font-black">{selectedExp.players}</span>
                       </div>
                    </div>
                 </div>
                 
                 {selectedExp.gamepasses && selectedExp.gamepasses.length > 0 && (
                   <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Gamepasses</h4>
                     <div className="grid grid-cols-2 gap-4">
                       {selectedExp.gamepasses.map(gp => (
                         <div key={gp.id} className="bg-gray-50 p-6 rounded-[35px] flex items-center justify-between border border-gray-200">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100">{gp.icon}</div>
                               <div className="flex flex-col">
                                  <span className="font-black text-xs uppercase text-black">{gp.name}</span>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase">{gp.description}</span>
                               </div>
                            </div>
                            <button onClick={() => handleBuyItem(gp)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${user.inventory.includes(gp.id) ? 'bg-gray-200 text-gray-400' : 'bg-yellow-500 text-white shadow-xl hover:scale-105'}`}>{user.inventory.includes(gp.id) ? 'Equipped' : gp.price + ' R$'}</button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 <button onClick={() => {setPlayingId(selectedExp.id); setActivePage('Playing'); setSelectedExp(null);}} className="w-full bg-green-600 text-white font-black py-12 rounded-[50px] text-5xl uppercase tracking-tighter shadow-2xl hover:bg-green-500 hover:scale-[1.02] transition-all active:scale-95">ENTER SERVER</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
