
import React from 'react';
import { Page, User } from '../types';
import { BovuxIcon } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activePage: Page;
  setActivePage: (page: Page) => void;
  onLoginClick: () => void;
  onSearch: (q: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activePage, setActivePage, onLoginClick, onSearch }) => {
  const menuItems: { name: Page; icon: string }[] = [
    { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Discover', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { name: 'Avatar', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'Market', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Friends', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Create', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F2F4F5]">
      <header className="bg-white px-10 h-20 flex items-center justify-between z-50 shadow-sm border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-12">
          <div className="text-3xl font-black italic tracking-tighter cursor-pointer flex items-center gap-3 group text-black" onClick={() => setActivePage('Home')}>
            <span className="bg-black text-white px-2 py-0.5 rounded-lg group-hover:rotate-12 transition-all">B</span> BLOXVERSE
          </div>
          <div className="hidden lg:flex bg-gray-100 rounded-2xl items-center px-6 py-2.5 w-[500px] border border-gray-200">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              onChange={e => { onSearch(e.target.value); if(activePage !== 'Discover') setActivePage('Discover'); }}
              placeholder="Search experiences..." 
              className="bg-transparent border-none outline-none text-sm px-4 w-full font-bold text-black" 
            />
          </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
              <div className="text-yellow-600"><BovuxIcon /></div> 
              <span className="font-black text-sm text-black">{user.robux >= 9999999 ? '∞' : user.robux.toLocaleString()}</span>
           </div>
           <div onClick={onLoginClick} className="flex items-center gap-4 cursor-pointer group">
              <div className="text-right">
                 <div className="text-xs font-black uppercase tracking-tighter leading-none text-black">{user.displayName}</div>
                 <div className="text-[9px] font-bold text-blue-600 uppercase">{user.role}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-900 border-2 border-white shadow-md flex items-center justify-center font-black text-white group-hover:scale-110 transition-all">
                {user.displayName[0].toUpperCase()}
              </div>
           </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col pt-8">
          <nav className="px-4 space-y-2">
            {menuItems.map((item) => (
              <button key={item.name} onClick={() => setActivePage(item.name)} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activePage === item.name ? 'bg-black text-white shadow-xl' : 'text-gray-700 hover:bg-gray-100 hover:text-black'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                <span className="uppercase tracking-widest text-[10px]">{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-10">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
