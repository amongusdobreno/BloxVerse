
import React from 'react';
import { Experience, SkinItem, Friend, Instance } from './types';

export const INITIAL_FRIENDS: Friend[] = [];

const createCreativeMap = (category: Experience['category'], color: string): Instance[] => {
  const baseId = `map_${Math.random().toString(36).substr(2, 9)}`;
  
  switch (category) {
    case 'Obby':
      return [
        { id: `${baseId}_start`, name: 'Start', type: 'part', data: { position: [0, 1, 0], scale: [15, 2, 15], color: '#333' }, children: [] },
        { id: `${baseId}_p1`, name: 'Neon Step 1', type: 'part', data: { position: [0, 6, -25], scale: [8, 1, 8], color: color }, children: [] },
        { id: `${baseId}_p2`, name: 'Neon Step 2', type: 'part', data: { position: [15, 12, -45], scale: [8, 1, 8], color: color }, children: [] },
        { id: `${baseId}_p3`, name: 'Neon Step 3', type: 'part', data: { position: [-15, 18, -65], scale: [8, 1, 8], color: color }, children: [] },
        { id: `${baseId}_goal`, name: 'Victory Island', type: 'part', data: { position: [0, 24, -90], scale: [20, 2, 20], color: '#FFD700' }, children: [] }
      ];
    case 'Racing':
      return [
        { id: `${baseId}_road`, name: 'Asphalt', type: 'part', data: { position: [0, 0.5, -150], scale: [40, 1, 400], color: '#222' }, children: [] },
        { id: `${baseId}_w1`, name: 'Left Barrier', type: 'part', data: { position: [-20, 5, -150], scale: [2, 12, 400], color: '#cc0000' }, children: [] },
        { id: `${baseId}_w2`, name: 'Right Barrier', type: 'part', data: { position: [20, 5, -150], scale: [2, 12, 400], color: '#cc0000' }, children: [] },
        { id: `${baseId}_finish`, name: 'Finish Line', type: 'part', data: { position: [0, 1.2, -340], scale: [40, 0.5, 5], color: '#ffffff' }, children: [] }
      ];
    case 'RPG':
      return [
        { id: `${baseId}_arena`, name: 'Colosseum Floor', type: 'part', data: { position: [0, 0.5, 0], scale: [150, 1, 150], color: '#554433' }, children: [] },
        { id: `${baseId}_pillar1`, name: 'Ancient Pillar', type: 'part', data: { position: [40, 20, 40], scale: [8, 40, 8], color: '#aaaaaa' }, children: [] },
        { id: `${baseId}_pillar2`, name: 'Ancient Pillar', type: 'part', data: { position: [-40, 20, 40], scale: [8, 40, 8], color: '#aaaaaa' }, children: [] },
        { id: `${baseId}_gate`, name: 'Dungeon Entrance', type: 'part', data: { position: [0, 15, -70], scale: [30, 30, 10], color: '#332211' }, children: [] }
      ];
    case 'Horror':
      return [
        { id: `${baseId}_f`, name: 'Haunted Floor', type: 'part', data: { position: [0, 0.5, -50], scale: [20, 1, 200], color: '#050505' }, children: [] },
        { id: `${baseId}_wL`, name: 'Dark Wall', type: 'part', data: { position: [-10, 15, -50], scale: [1, 30, 200], color: '#111111' }, children: [] },
        { id: `${baseId}_wR`, name: 'Dark Wall', type: 'part', data: { position: [10, 15, -50], scale: [1, 30, 200], color: '#111111' }, children: [] }
      ];
    default:
      return [{ id: `${baseId}_bp`, name: 'Baseplate', type: 'part', data: { position: [0, 0.5, 0], scale: [250, 1, 250], color: color }, children: [] }];
  }
};

const generate50Games = (): Experience[] => {
  const games: Experience[] = [];
  const themes = ["Mega", "Super", "Ultra", "Neo", "Dark", "Epic", "Pro", "Blox", "Pixel", "Dragon", "Zombie", "Galaxy", "Royal", "Island", "Cyber"];
  const suffixes = ["Simulator", "Obby", "Tycoon", "Battles", "Quest", "Adventure", "Ruins", "City"];
  const categories: Experience['category'][] = ['Obby', 'Simulator', 'RPG', 'Horror', 'Racing'];

  for (let i = 0; i < 50; i++) {
    const theme = themes[i % themes.length];
    const suffix = suffixes[i % suffixes.length];
    const cat = categories[i % categories.length];
    games.push({
      id: `gen_game_${i}`,
      title: `${theme} ${suffix} ${i + 1}`,
      creator: `User_${theme}${i}`,
      thumbnail: `https://picsum.photos/seed/blox_${i+200}/800/450`,
      rating: 75 + (i % 25),
      players: Math.floor(Math.random() * 80000),
      category: cat,
      description: `The best ${cat} game ever created in BloxVerse. Join the ${theme} community!`,
      hierarchy: [{ id: 'workspace', name: 'Workspace', type: 'folder', children: createCreativeMap(cat, i % 2 === 0 ? '#3b82f6' : '#ef4444') }]
    });
  }
  return games;
};

export const INITIAL_EXPERIENCES: Experience[] = [
  { 
    id: '1', title: 'Neon Odyssey', creator: 'SkyBuilders', thumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80', 
    rating: 88, players: 12400, category: 'Obby', description: 'Explore the neon-lit challenge across the sky.', 
    hierarchy: [{ id: 'workspace', name: 'Workspace', type: 'folder', children: createCreativeMap('Obby', '#ff00ff') }]
  },
  { 
    id: '30', title: 'Square Slayers', creator: 'PixelStudios', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 
    rating: 95, players: 450000, category: 'RPG', description: 'Battle blocks and conquer the digital world.', 
    hierarchy: [{ id: 'workspace', name: 'Workspace', type: 'folder', children: createCreativeMap('RPG', '#ff4444') }]
  },
  ...generate50Games()
];

export const SKIN_SHOP_ITEMS: SkinItem[] = [
  { id: 'skin_white', name: 'Pure White', price: 0, type: 'color', value: '#ffffff', icon: '⚪' },
  { id: 'skin_gold', name: 'Golden Skin', price: 5000, type: 'color', value: '#FFD700', icon: '✨' },
  { id: 'skin_void', name: 'Void Black', price: 2000, type: 'color', value: '#0a0a0a', icon: '🌑' },
  { id: 'skin_neon', name: 'Neon Pink', price: 1500, type: 'color', value: '#ff00ff', icon: '💖' },
  { id: 'skin_emerald', name: 'Emerald', price: 2500, type: 'color', value: '#50c878', icon: '🐍' },
  { id: 'skin_ruby', name: 'Ruby Red', price: 2200, type: 'color', value: '#e0115f', icon: '💎' },
  { id: 'skin_sapphire', name: 'Sapphire', price: 2200, type: 'color', value: '#0f52ba', icon: '🔷' },
  
  { id: 'face_smile', name: 'Classic Smile', price: 0, type: 'face', value: '😊', icon: '🙂' },
  { id: 'face_cool', name: 'Cool Shades', price: 500, type: 'face', value: '😎', icon: '🕶️' },
  { id: 'face_angry', name: 'Angry Block', price: 200, type: 'face', value: '😠', icon: '💢' },
  { id: 'face_robot', name: 'Cyber Face', price: 800, type: 'face', value: '🤖', icon: '🔌' },
  { id: 'face_rich', name: 'Bovux Face', price: 10000, type: 'face', value: '🤑', icon: '💸' },
  { id: 'face_ninja', name: 'Ninja Mask', price: 1200, type: 'face', value: '🥷', icon: '🗡️' },
  { id: 'face_ghost', name: 'Ghost Face', price: 1500, type: 'face', value: '👻', icon: '☁️' },

  { id: 'shirt_blue', name: 'Blue Hoodie', price: 0, type: 'shirt', value: '#3b82f6', icon: '👕' },
  { id: 'shirt_neon', name: 'Neon Green', price: 600, type: 'shirt', value: '#39ff14', icon: '🧥' },
  { id: 'shirt_crimson', name: 'Crimson Suit', price: 1200, type: 'shirt', value: '#990000', icon: '🤵' },
  { id: 'shirt_dark', name: 'Shadow Shirt', price: 900, type: 'shirt', value: '#1a1a1a', icon: '⬛' },
  { id: 'shirt_lava', name: 'Lava Armor', price: 5000, type: 'shirt', value: '#ff4500', icon: '🌋' },
  { id: 'shirt_galaxy', name: 'Galaxy Robe', price: 8000, type: 'shirt', value: '#483d8b', icon: '🌌' },

  { id: 'pants_black', name: 'Jeans Black', price: 0, type: 'pants', value: '#111', icon: '👖' },
  { id: 'pants_white', name: 'Snow Pants', price: 300, type: 'pants', value: '#fff', icon: '👟' },
  { id: 'pants_gold', name: 'Midas Pants', price: 4000, type: 'pants', value: '#ffd700', icon: '🌟' },

  { id: 'eff_fire', name: 'Flame Aura', price: 3000, type: 'effect', value: '#ff4500', icon: '🔥' },
  { id: 'eff_ice', name: 'Frost Aura', price: 3000, type: 'effect', value: '#00ffff', icon: '❄️' },
  { id: 'eff_rainbow', name: 'RGB Mastery', price: 50000, type: 'effect', value: 'rainbow', icon: '🌈' },
  { id: 'eff_stars', name: 'Star Trail', price: 7000, type: 'effect', value: '#ffff00', icon: '⭐' },
  { id: 'eff_shadow', name: 'Dark Mist', price: 12000, type: 'effect', value: '#000', icon: '💨' },
];

export const BovuxIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
  </svg>
);
