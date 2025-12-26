
import React, { useState } from 'react';
import { User, SkinItem, GamePass, Experience } from '../types';
import { SKIN_SHOP_ITEMS, BovuxIcon } from '../constants';

interface Props {
  user: User;
  experiences: Experience[];
  onBuyItem: (item: SkinItem | GamePass) => void;
}

const Marketplace: React.FC<Props> = ({ user, experiences, onBuyItem }) => {
  const [tab, setTab] = useState<'Catalog' | 'Gamepasses'>('Catalog');

  const allGamepasses = experiences.reduce((acc: GamePass[], exp) => {
    if (exp.gamepasses) return [...acc, ...exp.gamepasses];
    return acc;
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">Marketplace</h2>
        <div className="flex gap-4">
          <button onClick={() => setTab('Catalog')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'Catalog' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>Catalog</button>
          <button onClick={() => setTab('Gamepasses')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'Gamepasses' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>Gamepasses</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tab === 'Catalog' ? (
          SKIN_SHOP_ITEMS.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[40px] border border-gray-100 hover:shadow-xl transition-all group">
              <div className="aspect-square bg-gray-50 rounded-[30px] flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h4 className="font-black text-[10px] uppercase truncate text-black mb-1">{item.name}</h4>
              <div className="flex items-center gap-2 text-yellow-600 font-black text-[9px] mb-4">
                <BovuxIcon /> {item.price}
              </div>
              <button 
                onClick={() => onBuyItem(item)}
                className={`w-full py-3 rounded-xl text-[9px] font-black uppercase transition-all ${user.inventory.includes(item.id) ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {user.inventory.includes(item.id) ? 'Owned' : 'Buy Now'}
              </button>
            </div>
          ))
        ) : (
          allGamepasses.map(gp => (
            <div key={gp.id} className="bg-white p-6 rounded-[40px] border border-gray-100 hover:shadow-xl transition-all group">
              <div className="aspect-square bg-yellow-50 rounded-[30px] flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform">
                {gp.icon}
              </div>
              <h4 className="font-black text-[10px] uppercase truncate text-black mb-1">{gp.name}</h4>
              <div className="flex items-center gap-2 text-yellow-600 font-black text-[9px] mb-4">
                <BovuxIcon /> {gp.price}
              </div>
              <button 
                onClick={() => onBuyItem(gp)}
                className={`w-full py-3 rounded-xl text-[9px] font-black uppercase transition-all ${user.inventory.includes(gp.id) ? 'bg-gray-100 text-gray-400' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
              >
                {user.inventory.includes(gp.id) ? 'Owned' : 'Get Pass'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Marketplace;
