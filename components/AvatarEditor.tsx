
import React, { useState } from 'react';
import { User, AvatarConfig, SkinItem } from '../types';
import { SKIN_SHOP_ITEMS, BovuxIcon } from '../constants';

interface Props {
  user: User;
  onUpdate: (config: AvatarConfig) => void;
  onBuy: (item: SkinItem) => void;
  onApply: (item: SkinItem) => void;
}

const AvatarEditor: React.FC<Props> = ({ user, onUpdate, onBuy, onApply }) => {
  const [activeCategory, setActiveCategory] = useState<SkinItem['type'] | 'all'>('all');
  
  const categories: { id: SkinItem['type'] | 'all', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'color', label: 'Skin' },
    { id: 'face', label: 'Faces' },
    { id: 'shirt', label: 'Tops' },
    { id: 'pants', label: 'Bottoms' },
    { id: 'effect', label: 'Effects' },
    { id: 'emote', label: 'Emotes' }
  ];

  const filteredItems = activeCategory === 'all' 
    ? SKIN_SHOP_ITEMS 
    : SKIN_SHOP_ITEMS.filter(i => i.type === activeCategory);

  const handleApply = (item: SkinItem) => {
    if (item.type === 'emote') {
      alert(`Emote "${item.name}" equipped!`);
      return;
    }
    const newConfig = { ...user.avatarConfig };
    if (item.type === 'color') newConfig.skinColor = item.value;
    else if (item.type === 'face') newConfig.face = item.value;
    else if (item.type === 'shirt') newConfig.shirtColor = item.value;
    else if (item.type === 'pants') newConfig.pantsColor = item.value;
    else if (item.type === 'effect') newConfig.aura = item.value;
    
    onUpdate(newConfig);
    onApply(item);
  };

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col gap-10 pb-20 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-12 flex-1 min-h-0">
        
        {/* CHARACTER PREVIEW */}
        <div className="lg:w-[500px] bg-white rounded-[60px] shadow-2xl p-16 flex flex-col items-center justify-center relative overflow-hidden shrink-0 border border-gray-100">
           {user.avatarConfig.aura && (
            <div className={`absolute inset-0 animate-pulse opacity-10 ${user.avatarConfig.aura === 'rainbow' ? 'bg-gradient-to-br from-red-500 via-green-500 to-blue-500' : ''}`} style={{ backgroundColor: user.avatarConfig.aura !== 'rainbow' ? user.avatarConfig.aura : 'transparent' }} />
          )}
          
          <div className="relative z-10 flex flex-col items-center scale-110">
             <div className="relative w-48 h-[400px] flex flex-col items-center">
                {/* HEAD */}
                <div 
                  className={`w-28 h-28 mb-1 shadow-2xl relative flex items-center justify-center text-6xl z-30 transition-all duration-500 ${user.avatarConfig.headShape === 'round' ? 'rounded-full' : 'rounded-[30px]'}`}
                  style={{ backgroundColor: user.avatarConfig.skinColor }}
                >
                  {user.avatarConfig.face}
                </div>
                {/* TORSO */}
                <div 
                  className="w-36 h-40 rounded-[35px] shadow-2xl z-20 transition-all duration-500 relative flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: user.avatarConfig.shirtColor }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:15px_15px]" />
                </div>
                {/* ARMS */}
                <div className="absolute top-32 left-[-35px] w-14 h-40 rounded-[30px] shadow-xl z-10" style={{ backgroundColor: user.avatarConfig.skinColor }} />
                <div className="absolute top-32 right-[-35px] w-14 h-40 rounded-[30px] shadow-xl z-10" style={{ backgroundColor: user.avatarConfig.skinColor }} />
                {/* LEGS */}
                <div className="flex gap-3 -mt-2">
                  <div className="w-16 h-44 rounded-b-[30px] shadow-2xl transition-all duration-500" style={{ backgroundColor: user.avatarConfig.pantsColor }} />
                  <div className="w-16 h-44 rounded-b-[30px] shadow-2xl transition-all duration-500" style={{ backgroundColor: user.avatarConfig.pantsColor }} />
                </div>
             </div>
          </div>

          <div className="mt-16 text-center relative z-10">
             <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-black">{user.displayName}</h2>
             <span className="bg-black text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 inline-block">{user.role}</span>
          </div>
        </div>

        {/* CATALOG CONTENT */}
        <div className="flex-1 bg-white rounded-[60px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
           <div className="px-12 py-10 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-3xl font-black italic tracking-tighter uppercase text-black">Appearance Shop</h3>
                   <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-[25px] shadow-xl border border-gray-100">
                      <div className="text-yellow-600 scale-125"><BovuxIcon /></div>
                      <span className="font-black text-lg text-black">{user.robux >= 9999999 ? '∞' : user.robux.toLocaleString()}</span>
                   </div>
                </div>
                <div className="flex flex-wrap gap-3">
                   {categories.map(cat => (
                     <button 
                       key={cat.id}
                       onClick={() => setActiveCategory(cat.id)}
                       className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeCategory === cat.id ? 'bg-black text-white shadow-2xl scale-105' : 'bg-white text-gray-500 hover:text-black border border-gray-200'}`}
                     >
                       {cat.label}
                     </button>
                   ))}
                </div>
              </div>
           </div>

           <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
                 {filteredItems.map(item => (
                   <div 
                    key={item.id} 
                    className={`bg-white rounded-[50px] border p-8 flex flex-col transition-all duration-500 group hover:shadow-2xl hover:-translate-y-2 ${user.inventory.includes(item.id) ? 'border-black/5 ring-4 ring-black/5' : 'border-gray-100 hover:border-black'}`}
                   >
                      <div className="aspect-square rounded-[35px] bg-gray-50 mb-6 flex items-center justify-center text-6xl transition-transform group-hover:scale-110">
                         {item.icon}
                      </div>
                      <div className="font-black text-xs uppercase mb-2 truncate tracking-tight text-black">{item.name}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase mb-4">{item.type}</div>
                      <div className="flex flex-col mt-auto gap-3">
                         {user.inventory.includes(item.id) ? (
                           <button onClick={() => handleApply(item)} className="w-full py-4 bg-black text-white text-[10px] font-black uppercase rounded-[20px] hover:bg-gray-800 transition-all">
                              {item.type === 'emote' ? 'Equipped' : 'Equip Item'}
                           </button>
                         ) : (
                           <button onClick={() => onBuy(item)} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white text-[10px] font-black uppercase rounded-[20px] hover:bg-blue-700 transition-all shadow-xl">
                              <BovuxIcon /> {item.price}
                           </button>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AvatarEditor;
