
import React from 'react';
import { Experience } from '../types';

interface Props {
  experience: Experience;
  onPlay: (id: string) => void;
}

const ExperienceCard: React.FC<Props> = ({ experience, onPlay }) => {
  return (
    <div 
      className="group cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onPlay(experience.id)}
    >
      <div className="aspect-[16/9] w-full bg-gray-200 rounded-xl overflow-hidden mb-3 relative">
        <img 
          src={experience.thumbnail} 
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <svg className="w-6 h-6 text-green-600 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <h3 className="font-extrabold text-sm truncate mb-1 text-black uppercase tracking-tighter group-hover:text-blue-700 transition-colors">
        {experience.title}
      </h3>
      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span>{experience.rating}%</span>
          </div>
          <div className="flex items-center gap-0.5">
            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>{(experience.players/1000).toFixed(1)}K</span>
          </div>
        </div>
        <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded uppercase">{experience.category}</span>
      </div>
    </div>
  );
};

export default ExperienceCard;
