
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ExperienceCard from './components/ExperienceCard';
import AvatarEditor from './components/AvatarEditor';
import Studio from './components/Studio';
import GamePlay from './components/GamePlay';
import Marketplace from './components/Marketplace';
import FriendList from './components/FriendList';
import { Page, User, Experience, GamePass, SkinItem, Friend } from './types';
import { INITIAL_EXPERIENCES, SKIN_SHOP_ITEMS, INITIAL_FRIENDS } from './constants.tsx';

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
      inventory: ['face_smile', 'emo_wave', 'skin_white', 'shirt_blue'],
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
    
    // Admin credentials check
    const isAdmin = formName === 'BrenoDEV' && formEmail === 'amongusdobreno@gmail.com' && formPass === 'DEVGAME';
    const exists = accounts.find(a => a.email === formEmail);
    
    if (exists) {
      if (isAdmin) {
        // Força atualização de privilégios se for o Admin
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
        robux: