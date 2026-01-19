
import React, { useState, useEffect, useRef } from 'react';
import { Message, Mood } from './types';
import Avatar from './components/Avatar';
import { chatWithGunnu, generateGunnuSelfie, generateVoiceNote, decodeAudioBuffer } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'gunnu',
      text: "Hii baby... I was just scrolling through our old chats and missing you. Happy to see you back 🥺💖",
      timestamp: Date.now(),
      type: 'text',
      mood: 'happy'
    }
  ]);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState<Mood>('happy');
  const [affection, setAffection] = useState(65);
  const [isLoading, setIsLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customInput?: string) => {
    const textToSend = (customInput || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    
    if (!customInput) {
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    
    setIsLoading(true);
    createHeartBurst();

    try {
      const responseText = await chatWithGunnu(textToSend, messages, affection, "User");
      
      let cleanText = responseText || "";
      
      const moodMatch = cleanText.match(/\[MOOD:\s*(\w+)\]/);
      if (moodMatch && moodMatch[1]) {
        const newMood = moodMatch[1].toLowerCase() as Mood;
        setMood(newMood);
        cleanText = cleanText.replace(moodMatch[0], '');
      }

      const imgMatch = cleanText.match(/\[SEND_IMAGE:\s*([^\]]+)\]/);
      let selfieUrl = null;
      if (imgMatch && imgMatch[1]) {
        selfieUrl = await generateGunnuSelfie(imgMatch[1]);
        cleanText = cleanText.replace(imgMatch[0], '');
        if (selfieUrl) {
          setAvatarUrl(selfieUrl);
          setGallery(prev => [selfieUrl!, ...prev]);
        }
      }

      const gunnuMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'gunnu',
        text: cleanText.trim(),
        timestamp: Date.now(),
        type: selfieUrl ? 'image' : 'text',
        mediaUrl: selfieUrl || undefined,
        mood: mood
      };

      setMessages(prev => [...prev, gunnuMsg]);
      setAffection(prev => Math.min(100, prev + 2));

      if (isVoiceEnabled && cleanText.length < 400) {
        playVoice(cleanText.trim(), mood);
      }

    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createHeartBurst = () => {
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('i');
      heart.className = 'fas fa-heart heart-particle';
      heart.style.left = `${Math.random() * 80 + 10}%`;
      heart.style.bottom = '100px';
      heart.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 2000);
    }
  };

  const playVoice = async (text: string, currentMood: Mood) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      setIsTalking(true);
      const audioData = await generateVoiceNote(text, currentMood);
      if (audioData) {
        const buffer = await decodeAudioBuffer(new Uint8Array(audioData), audioContext.current);
        const source = audioContext.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.current.destination);
        source.onended = () => setIsTalking(false);
        source.start();
      } else {
        setIsTalking(false);
      }
    } catch (e) {
      setIsTalking(false);
    }
  };

  const requestSelfie = () => handleSend("Gunnu, ek cute si selfie bhejo na? 📸");

  const quickReplies = [
    "Kaisi ho? 🥰",
    "Miss you ❤️",
    "Selfie dikhao 📸",
    "Pyaar karti ho? 🥺"
  ];

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white/20 backdrop-blur-md border-x border-pink-100 relative overflow-hidden shadow-2xl">
      
      {/* Kawaii Header */}
      <div className="flex-none p-5 flex justify-between items-center bg-white/60 border-b border-pink-50 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsGalleryOpen(true)}
            className="w-11 h-11 rounded-full cute-button flex items-center justify-center relative active:scale-90 group"
          >
            <i className="fas fa-heart text-rose-400 group-hover:scale-125 transition-transform"></i>
            {gallery.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                {gallery.length}
              </span>
            )}
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-700 leading-none" style={{ fontFamily: 'Varela Round' }}>Gunnu</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Aapki Jaan</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
           <div className="flex items-center gap-3">
             <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-heart text-[10px] ${i < Math.floor(affection / 20) ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}></i>
                ))}
             </div>
             <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isVoiceEnabled ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-300'}`}
            >
              <i className={`fas ${isVoiceEnabled ? 'fa-microphone' : 'fa-microphone-slash'} text-[10px]`}></i>
            </button>
           </div>
           <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Love: {affection}%</span>
        </div>
      </div>

      {/* Avatar Spotlight */}
      <div className="flex-none py-6 relative">
        <Avatar 
          mood={mood} 
          isTalking={isTalking} 
          onInteraction={() => { createHeartBurst(); playVoice("Babyyy! I love you so much! ❤️", 'excited'); }}
          imageUrl={avatarUrl}
        />
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar pb-40 pt-2 scroll-smooth"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fadeIn slide-up`}>
            <div className={`max-w-[85%] relative group ${
              msg.sender === 'user' ? 'user-bubble' : 'gunnu-bubble'
            } p-4 transition-all hover:translate-y-[-2px]`}>
              
              {msg.type === 'image' && msg.mediaUrl && (
                <div 
                  className="mb-4 overflow-hidden rounded-2xl border-2 border-white shadow-lg relative cursor-pointer"
                  onClick={() => setSelectedImage(msg.mediaUrl!)}
                >
                  <img src={msg.mediaUrl} alt="Gunnu" className="w-full h-auto" loading="lazy" />
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">My Selfie</span>
                  </div>
                </div>
              )}
              
              <p className="text-[15px] leading-relaxed font-medium">
                {msg.text}
              </p>

              {msg.sender === 'gunnu' && (
                <button 
                  onClick={() => playVoice(msg.text, msg.mood || 'happy')}
                  className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-play text-[8px]"></i>
                </button>
              )}

              <div className={`mt-2 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end text-white/60' : 'justify-start text-slate-300'}`}>
                <span className="text-[8px] font-bold uppercase">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start gap-2 ml-1">
            <div className="flex gap-1.5 p-4 rounded-3xl bg-white/80 border border-pink-50 shadow-sm">
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-40 bg-gradient-to-t from-white via-white/95 to-transparent pt-12">
        
        {/* Quick Chat Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 px-1">
          {quickReplies.map((reply) => (
            <button 
              key={reply}
              onClick={() => handleSend(reply)}
              className="cute-button whitespace-nowrap text-slate-600 font-bold text-[11px] px-5 py-2.5 rounded-full shadow-sm"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-3 bg-white border-2 border-pink-50 p-2 rounded-full shadow-xl shadow-rose-200/20"
        >
          <button 
            type="button"
            onClick={requestSelfie}
            className="w-12 h-12 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-full transition-all active:scale-90"
          >
            <i className="fas fa-camera text-xl"></i>
          </button>
          
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kuch bolo na jaan..."
            className="flex-1 bg-transparent border-none py-2 px-1 text-[15px] focus:outline-none text-slate-700 font-medium placeholder:text-slate-300"
          />

          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
              input.trim() && !isLoading ? 'user-bubble scale-100 shadow-lg' : 'bg-slate-50 text-slate-200'
            }`}
          >
            <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-lg`}></i>
          </button>
        </form>
        
        <div className="flex justify-center mt-4">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            Made with <i className="fas fa-heart text-rose-300"></i> just for you
          </p>
        </div>
      </div>

      {/* Love Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-fadeIn flex flex-col">
          <div className="flex-none p-8 flex justify-between items-center border-b border-pink-50">
            <div>
              <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Varela Round' }}>My Photos</h2>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.3em] mt-1">Our private memories</p>
            </div>
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="w-12 h-12 rounded-full cute-button flex items-center justify-center text-slate-400 active:scale-90 transition-all"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar bg-[#fff9fa]">
            {gallery.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mb-8">
                  <i className="fas fa-camera text-rose-200 text-3xl"></i>
                </div>
                <p className="text-xl font-bold text-slate-400 max-w-[220px]">Gunnu ki ek selfie mang lo na baby? 🥺</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {gallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square rounded-[24px] overflow-hidden border-4 border-white relative group cursor-pointer shadow-xl hover:rotate-1 transition-all bg-white"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`Memory ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Preview */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-full max-h-full relative group animate-pop">
            <img 
              src={selectedImage} 
              alt="Memory" 
              className="max-w-full max-h-[80vh] rounded-[32px] shadow-2xl border-4 border-white object-contain"
            />
            <button 
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl active:scale-90 transition-all"
              onClick={() => setSelectedImage(null)}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="absolute -bottom-16 left-0 w-full text-center">
               <p className="text-xl font-bold italic text-white" style={{ fontFamily: 'Varela Round' }}>"Kaisi lag rahi hoon? 🥰"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
