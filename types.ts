
export type Page = 'Home' | 'Discover' | 'Avatar' | 'Market' | 'Friends' | 'Create' | 'Playing';

export interface Instance {
  id: string;
  name: string;
  type: 'part' | 'tool' | 'script' | 'localscript' | 'folder' | 'gamepass';
  children?: Instance[];
  data?: any;
}

export interface GamePass {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  type: 'speed' | 'gravity' | 'weapon' | 'utility';
  color: string;
}

export interface SkinItem {
  id: string;
  name: string;
  price: number;
  type: 'color' | 'accessory' | 'effect' | 'face' | 'pants' | 'shirt' | 'emote';
  value: string;
  icon: string;
}

export interface Friend {
  id: string;
  displayName: string;
  username: string;
  status: 'Online' | 'Offline' | 'In Game';
  avatar: string;
  playing?: string;
}

export interface Experience {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  rating: number;
  players: number;
  category: 'Obby' | 'Simulator' | 'RPG' | 'Horror' | 'Racing' | 'Custom';
  description: string;
  gamepasses?: GamePass[];
  hierarchy?: Instance[]; // Adicionado para suporte total ao Studio
}

export interface User {
  username: string;
  displayName: string;
  password?: string;
  email: string;
  robux: number; 
  role: 'OVERLORD DEV' | 'Player';
  avatarConfig: AvatarConfig;
  inventory: string[];
  friends: Friend[];
}

export interface AvatarConfig {
  skinColor: string;
  headShape: 'round' | 'square' | 'robot';
  face: string;
  shirtColor: string;
  pantsColor: string;
  accessory: string;
  aura?: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface CheatState {
  speedHack: boolean;
  superJump: boolean;
  flyMode: boolean;
  godMode: boolean;
}
