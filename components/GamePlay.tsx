
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getAIGameChat } from '../services/geminiService';
import { Experience, ChatMessage, User, Instance } from '../types';

interface Props {
  experience: Experience;
  user: User;
  onExit: () => void;
  onPointCollect: () => void;
  onRate: (isLike: boolean) => void;
}

const GamePlay: React.FC<Props> = ({ experience, user, onExit, onRate }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef<THREE.Group | null>(null);
  const worldParts = useRef<THREE.Mesh[]>([]);
  const ph = useRef({ 
    velocity: new THREE.Vector3(0, 0, 0), 
    onGround: true,
    height: 3,
    width: 1.2
  });
  
  // Camera State
  const camState = useRef({
    theta: Math.PI / 4, 
    phi: Math.PI / 3,   
    radius: 40,         
    isRotating: false,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    let skyColor = 0x87CEEB;
    let groundColor = 0x4CAF50;
    
    if (experience.category === 'Horror') { skyColor = 0x000000; groundColor = 0x050505; }
    else if (experience.category === 'Obby') { skyColor = 0x1a1a2e; groundColor = 0x111111; }
    else if (experience.category === 'Racing') { skyColor = 0x4488ff; groundColor = 0x222222; }

    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(100, 200, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshStandardMaterial({ color: groundColor }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const renderItems = (items: Instance[]) => {
      items.forEach(item => {
        if (item.type === 'part' && item.data) {
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: item.data.color || '#ffffff' })
          );
          mesh.scale.set(item.data.scale[0], item.data.scale[1], item.data.scale[2]);
          mesh.position.set(item.data.position[0], item.data.position[1], item.data.position[2]);
          mesh.castShadow = true; mesh.receiveShadow = true;
          scene.add(mesh);
          worldParts.current.push(mesh);
        }
        if (item.children) renderItems(item.children);
      });
    };

    if (experience.hierarchy) renderItems(experience.hierarchy);

    // Player Setup
    const pGroup = new THREE.Group();
    playerRef.current = pGroup;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.8), new THREE.MeshStandardMaterial({ color: user.avatarConfig.shirtColor }));
    body.position.y = 1;
    const head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: user.avatarConfig.skinColor }));
    head.position.y = 2.6;
    pGroup.add(body, head);
    scene.add(pGroup);
    pGroup.position.set(0, 10, 0);

    // Controls
    const onMouseDown = (e: MouseEvent) => { if (e.button === 2) camState.current.isRotating = true; camState.current.lastX = e.clientX; camState.current.lastY = e.clientY; };
    const onMouseUp = () => { camState.current.isRotating = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!camState.current.isRotating) return;
      camState.current.theta -= (e.clientX - camState.current.lastX) * 0.005;
      camState.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, camState.current.phi + (e.clientY - camState.current.lastY) * 0.005));
      camState.current.lastX = e.clientX; camState.current.lastY = e.clientY;
    };
    const onWheel = (e: WheelEvent) => { camState.current.radius = Math.max(15, Math.min(150, camState.current.radius + e.deltaY * 0.08)); };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel);
    window.addEventListener('contextmenu', e => e.preventDefault());

    const onKeyDown = (e: KeyboardEvent) => keysPressed.current[e.code] = true;
    const onKeyUp = (e: KeyboardEvent) => keysPressed.current[e.code] = false;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const moveSpeed = user.inventory.includes('gp_speed_coil') ? 0.95 : 0.6;
      const jumpPower = 0.55;
      const gravity = 0.022;

      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), camState.current.theta);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), camState.current.theta);
      
      const moveDir = new THREE.Vector3(0, 0, 0);
      if (keysPressed.current['KeyW']) moveDir.add(forward);
      if (keysPressed.current['KeyS']) moveDir.sub(forward);
      if (keysPressed.current['KeyA']) moveDir.sub(right);
      if (keysPressed.current['KeyD']) moveDir.add(right);
      
      if (moveDir.length() > 0) {
        moveDir.normalize().multiplyScalar(moveSpeed);
        ph.current.velocity.x = moveDir.x;
        ph.current.velocity.z = moveDir.z;
        pGroup.rotation.y = THREE.MathUtils.lerp(pGroup.rotation.y, Math.atan2(moveDir.x, moveDir.z) + Math.PI, 0.1);
      } else {
        ph.current.velocity.x *= 0.8;
        ph.current.velocity.z *= 0.8;
      }

      // Physics Cycle
      ph.current.velocity.y -= gravity;
      if (keysPressed.current['Space'] && ph.current.onGround) {
        ph.current.velocity.y = jumpPower;
        ph.current.onGround = false;
      }

      // Resolvendo movimento horizontal e vertical separadamente para evitar travamentos
      const nextPos = pGroup.position.clone();
      
      // Movimento Vertical Primeiro
      nextPos.y += ph.current.velocity.y;
      let isGrounded = false;
      
      const vBox = new THREE.Box3().setFromCenterAndSize(
        nextPos.clone().add(new THREE.Vector3(0, 1.4, 0)), 
        new THREE.Vector3(ph.current.width * 0.9, ph.current.height, ph.current.width * 0.9)
      );

      for (const part of worldParts.current) {
        const b = new THREE.Box3().setFromObject(part);
        if (b.intersectsBox(vBox)) {
          if (ph.current.velocity.y < 0 && pGroup.position.y >= b.max.y - 0.2) {
             nextPos.y = b.max.y;
             ph.current.velocity.y = 0;
             isGrounded = true;
          } else if (ph.current.velocity.y > 0) {
             nextPos.y = pGroup.position.y;
             ph.current.velocity.y = 0;
          }
          break;
        }
      }

      // Movimento Horizontal Depois
      const hNextPos = nextPos.clone();
      hNextPos.x += ph.current.velocity.x;
      hNextPos.z += ph.current.velocity.z;

      const hBox = new THREE.Box3().setFromCenterAndSize(
        hNextPos.clone().add(new THREE.Vector3(0, 1.4, 0)), 
        new THREE.Vector3(ph.current.width, ph.current.height * 0.8, ph.current.width)
      );

      let horizontalBlocked = false;
      for (const part of worldParts.current) {
        const b = new THREE.Box3().setFromObject(part);
        if (b.intersectsBox(hBox)) {
          // Permite subir degraus pequenos (step height)
          if (b.max.y - nextPos.y < 0.6) {
             nextPos.y = b.max.y;
             isGrounded = true;
          } else {
             horizontalBlocked = true;
          }
          break;
        }
      }

      if (!horizontalBlocked) {
        nextPos.x = hNextPos.x;
        nextPos.z = hNextPos.z;
      }

      if (nextPos.y <= 0) {
        nextPos.y = 0;
        ph.current.velocity.y = 0;
        isGrounded = true;
      }

      pGroup.position.copy(nextPos);
      ph.current.onGround = isGrounded;

      // Update 360 Camera
      const targetCamX = pGroup.position.x + camState.current.radius * Math.sin(camState.current.phi) * Math.sin(camState.current.theta);
      const targetCamY = pGroup.position.y + camState.current.radius * Math.cos(camState.current.phi) + 10;
      const targetCamZ = pGroup.position.z + camState.current.radius * Math.sin(camState.current.phi) * Math.cos(camState.current.theta);
      
      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.2);
      camera.lookAt(pGroup.position.x, pGroup.position.y + 3, pGroup.position.z);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => { 
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose(); 
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [experience, user]);

  return (
    <div className="fixed inset-0 bg-black z-[100] font-sans overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl p-5 rounded-[30px] border border-white/10 text-white flex items-center gap-5 shadow-2xl">
         <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl">{user.displayName[0]}</div>
         <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Playing</div>
            <div className="text-sm font-black uppercase tracking-tight">{experience.title}</div>
         </div>
      </div>
      <div className="absolute top-6 right-6 flex gap-4">
        <button onClick={onExit} className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95">Leave Game</button>
      </div>

      <div className="absolute bottom-8 right-8 text-white/40 text-[9px] font-black uppercase tracking-widest bg-black/40 px-6 py-3 rounded-full border border-white/5">
        Right Click to Rotate Camera • W A S D to Move
      </div>

      <div className="absolute bottom-8 left-8 w-80 space-y-4">
         <div className="bg-black/30 backdrop-blur-xl p-5 rounded-[35px] h-40 overflow-y-auto border border-white/5 flex flex-col gap-3 custom-scrollbar">
            {chatMessages.map(m => (
              <div key={m.id} className="text-white text-[11px] animate-in slide-in-from-left duration-300">
                <span className="font-black text-blue-400 mr-2">[{m.user}]:</span>
                <span className="font-medium opacity-90">{m.text}</span>
              </div>
            ))}
         </div>
         <input 
           value={chatInput} 
           onChange={e => setChatInput(e.target.value)} 
           onKeyDown={async e => { 
             if(e.key === 'Enter' && chatInput) { 
               const msg = {id:Date.now().toString(), user: user.displayName, text: chatInput, timestamp: Date.now()};
               setChatMessages(p => [...p, msg]); 
               setChatInput('');
               const aiRes = await getAIGameChat([], chatInput);
               setChatMessages(p => [...p, {id:'ai'+Date.now(), user: 'BloxBot', text: aiRes, timestamp: Date.now()}]);
             } 
           }} 
           className="w-full bg-black/60 p-5 rounded-[25px] text-white text-[11px] outline-none border border-white/10 focus:border-blue-500 font-bold placeholder:text-white/20" 
           placeholder="Press Enter to chat..." 
         />
      </div>
    </div>
  );
};

export default GamePlay;
