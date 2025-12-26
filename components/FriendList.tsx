
import React from 'react';
import { User, Friend } from '../types';

interface Props {
  user: User;
  onJoin: (friend: Friend) => void;
  onAddFriend: (name?: string) => void;
  onRemoveFriend: (id: string) => void;
}

const FriendList: React.FC<Props> = ({ user, onJoin, onAddFriend, onRemoveFriend }) => {
  return (
    <div className="max-w-[800px] mx-auto space-y-10 animate-in fade-in pb-20">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">Friends</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">{user.friends.length} Total BloxVerse Contacts</p>
        </div>
        <button onClick={() => onAddFriend()} className="bg-blue-600 text-white font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Find Friends</button>
      </div>

      {user.friends.length === 0 ? (
        <div className="bg-white p-20 rounded-[50px] text-center border-2 border-dashed border-gray-100">
           <div className="text-6xl mb-6 opacity-20">👥</div>
           <h3 className="text-xl font-black uppercase text-gray-300">Your friend list is empty</h3>
           <button onClick={() => onAddFriend()} className="mt-8 bg-gray-100 text-gray-600 px-10 py-3 rounded-2xl text-[10px] font-black uppercase">Start Searching</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {user.friends.map(friend => (
            <div key={friend.id} className="bg-white p-6 rounded-[35px] border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-[25px] flex items-center justify-center text-4xl border border-gray-200">
                  {friend.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-lg text-black uppercase">{friend.displayName}</h4>
                    <span className={`w-3 h-3 rounded-full ${friend.status === 'Online' ? 'bg-green-500' : friend.status === 'In Game' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">@{friend.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {friend.status === 'In Game' && (
                  <button onClick={() => onJoin(friend)} className="bg-green-600 hover:bg-green-500 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transition-all">Join</button>
                )}
                <button onClick={() => onRemoveFriend(friend.id)} className="bg-red-50 text-red-400 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendList;
