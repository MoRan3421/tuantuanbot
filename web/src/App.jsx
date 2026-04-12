import React, { useState, useEffect } from "react";
import { 
  Plus, LogOut, Activity, Settings,
  Database, User as UserIcon, MessageSquare, Hash, Award
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithPopup, OAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyARG5tC8zQp8kA-TYvScGFS1SdV__9KwCA",
    authDomain: "tuantuanbot-28647.firebaseapp.com",
    projectId: "tuantuanbot-28647",
    storageBucket: "tuantuanbot-28647.appspot.com",
    messagingSenderId: "107030999216413628761",
    appId: "1:107030999216413628761:web:d696586435d2becbdc10cb467aba5ee23"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const DISCORD_PROVIDER_ID = import.meta.env.VITE_DISCORD_PROVIDER_ID || 'oidc.discord';
const provider = new OAuthProvider(DISCORD_PROVIDER_ID);
provider.addScope('identify');
provider.addScope('guilds');

// --- LUXURY CARD & TOGGLE ---
const LuxuryCard = ({ title, icon: Icon, children }) => (
  <div className="zen-card">
    <div className="card-title">
        <div className="p-3 rounded-2xl bg-pink-400/10 text-pink-400"><Icon size={24} /></div>
        {title}
    </div>
    <div className="card-body">{children}</div>
  </div>
);

const LuxuryToggle = ({ label, value, onToggle }) => (
  <div className="toggle-row">
    <div className="text-sm font-black opacity-30 uppercase tracking-[2px]">{label}</div>
    <div 
        className={`toggle-switch ${value === 'ENABLED' ? 'on' : ''}`} 
        onClick={() => onToggle(value === 'ENABLED' ? 'DISABLED' : 'ENABLED')}
    />
  </div>
);

const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [guilds, setGuilds] = useState(() => {
    try {
      const raw = localStorage.getItem("tt_guilds");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [guildConfig, setGuildConfig] = useState({});
  const [userStats, setUserStats] = useState({ xp: 0, level: 1, bamboo: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [premiumKey, setPremiumKey] = useState("");
  const [busy, setBusy] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const ONLY_GUILD_ID = import.meta.env.VITE_GUILD_ID || "";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!selectedGuild) return;
    // Guild Config Sync
    const unsubConfig = onSnapshot(doc(firestore, "guilds", selectedGuild.id), (doc) => {
      if (doc.exists()) setGuildConfig(doc.data());
    });

    // User Stats Sync
    if (authUser?.uid) {
        const discordId = authUser.providerData[0].uid;
        const unsubStats = onSnapshot(doc(firestore, "guilds", selectedGuild.id, "members", discordId), (doc) => {
            if (doc.exists()) setUserStats(doc.data());
        });
        return () => { unsubConfig(); unsubStats(); };
    }

    return unsubConfig;
  }, [selectedGuild, authUser]);

  useEffect(() => {
    if (!selectedGuild) return;
    const fetchLeaderboard = async () => {
        const q = query(collection(firestore, "guilds", selectedGuild.id, "members"), where("xp", ">", 0));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id }))
            .sort((a,b) => b.xp - a.xp)
            .slice(0, 5);
        setLeaderboard(list);
    };
    fetchLeaderboard();
  }, [selectedGuild]);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      
      const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { authorization: `Bearer ${token}` }
      });
      const list = await response.json();
      const safe = Array.isArray(list) ? list : [];
      setGuilds(safe);
      try { localStorage.setItem("tt_guilds", JSON.stringify(safe)); } catch {}
    } catch (e) { alert("Login Error: " + e.message); }
  };

  const updateConfig = async (key, val) => {
    if (!selectedGuild) return;
    await setDoc(doc(firestore, "guilds", selectedGuild.id), { [key]: val }, { merge: true });
  };

  const startCheckout = async (plan) => {
    if (!selectedGuild || !authUser) return;
    setBusy(true);
    try {
      const idToken = await authUser.getIdToken();
      const r = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ guildId: selectedGuild.id, plan }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Checkout failed");
      if (data?.url) window.location.href = data.url;
      else throw new Error("Missing checkout URL");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const redeemFromWeb = async () => {
    if (!selectedGuild || !authUser || !premiumKey.trim()) return;
    setBusy(true);
    try {
      const idToken = await authUser.getIdToken();
      const r = await fetch(`${API_BASE}/api/premium/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ guildId: selectedGuild.id, key: premiumKey.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Redeem failed");
      setPremiumKey("");
      alert("æ¿€æ´»æˆåŠŸï¼Œå›¢å›¢åƒåˆ°é»„é‡‘ç«¹å­å•¦ã€‚");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inviteBot = () => {
    window.open(`https://discord.com/api/oauth2/authorize?client_id=1481640516931031050&permissions=8&scope=bot%20applications.commands`, "_blank");
  };

  if (!authUser) {
    return (
      <div className="supreme-layout justify-center items-center">
        <div className="landing-hero">
            <img src="/panda-mascot.png" className="big-panda-anim" />
            <h1 className="text-7xl font-bold">å›¢å›¢ <span>å°å±‹</span></h1>
            <p className="text-lg font-medium opacity-60 mt-4 italic">â€œ å›¢å›¢ä¼šä¸€ç›´é™ªç€ä¸»äººå“’ï¼ðŸŒ¸ â€</p>
            <p className="text-[10px] font-bold opacity-30 mt-6 uppercase tracking-[4px]">Elite Hub v7.0 Â· Designed by godking512</p>
            <div className="mt-12 flex gap-8">
                <button onClick={login} className="btn-premium-cta !px-12 text-lg">å¼€å¯å°å±‹ ðŸ¾</button>
                <button onClick={inviteBot} className="btn-premium-cta !px-12 bg-transparent border-2 border-pink-400 !text-pink-400 shadow-none hover:bg-pink-400/10">æ‰¾å›¢å›¢çŽ© ðŸŽ</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supreme-layout">
      {/* Sidebar */}
      <div className="side-tray">
        <div className="logo-wrap cursor-pointer" onClick={() => setSelectedGuild(null)}>
            <img src="/panda-mascot.png" className="w-16 h-16" />
        </div>
        <div className="server-list-v">
            {guilds
              ?.filter((g) => (!ONLY_GUILD_ID ? true : g.id === ONLY_GUILD_ID))
              .filter(g => (g.permissions & 0x8) === 0x8 || (g.permissions & 0x20) === 0x20)
              .map(guild => (
                <div 
                    key={guild.id} 
                    className={`server-node ${selectedGuild?.id === guild.id ? 'active' : ''}`}
                    onClick={() => setSelectedGuild(guild)}
                >
                    {guild.icon 
                        ? <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} /> 
                        : <span className="font-bold text-lg text-pink-400">{guild.name.charAt(0)}</span>
                    }
                    <div className="node-tooltip">{guild.name}</div>
                </div>
            ))}
            <div onClick={inviteBot} className="server-node opacity-40 hover:opacity-100 border-dashed border-pink-400 bg-transparent"><Plus size={32} className="text-pink-400" /></div>
        </div>
        <div onClick={() => { try { localStorage.removeItem("tt_guilds"); } catch {} ; signOut(auth); }} className="mt-auto cursor-pointer p-4 hover:bg-red-50 rounded-full transition-all text-red-300">
            <LogOut size={32} />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="workspace">
        <div className="top-nav">
            <div className="guild-info">
                <h1>{selectedGuild ? selectedGuild.name : 'å¤§å®¶åº­ ðŸ '}</h1>
                <p>{selectedGuild && guildConfig.isPremium ? "ðŸ† å°Šè´µçš„è‡³å°ŠæœåŠ¡å™¨ Â· Supreme+ æ¿€æ´»ç ç”Ÿæ•ˆä¸­ âœ¨" : "æ¬¢è¿Žå…‰ä¸´å›¢å›¢çš„æŽ§åˆ¶ä¸­å¿ƒå–µ~"}</p>
            </div>
            
            <div className="flex items-center gap-10">
                <div className="flex items-center bg-white p-3 rounded-full border-2 border-pink-100 gap-6 pr-8 shadow-sm">
                    <img src={authUser.photoURL} className="w-12 h-12 rounded-full border-2 border-pink-300" />
                    <div>
                        <div className="text-sm font-bold text-gray-700">{authUser.displayName}</div>
                        <div className="text-[10px] text-pink-400 font-bold uppercase">{guildConfig.isPremium ? "è‡³å°Šç†ŠçŒ«é‡‘ä¸» ðŸ’Ž" : "æœ€å¯çˆ±çš„å°ä¸»äºº ðŸ’–"}</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="view-port">
            {!selectedGuild ? (
                <LuxuryCard title="å›¢å›¢çš„çŠ¶æ€æŠ¥å‘Š" icon={Activity}>
                    <div className="flex flex-col items-center">
                        <img src="/hero-scene.png" className="w-[80%] rounded-[40px] shadow-xl mb-8" />
                        <p className="text-lg font-bold opacity-40 text-center px-10">è¯·åœ¨å·¦è¾¹é€‰ä¸€ä¸ªæœåŠ¡å™¨ï¼Œè®©å›¢å›¢ä¸ºæ‚¨æ•ˆåŠ³å§ï¼ðŸ¾</p>
                    </div>
                </LuxuryCard>
            ) : (
                <>
                {/* User Stats Card */}
                <LuxuryCard title="æˆ‘çš„ç†ŠçŒ«æ•°æ®" icon={UserIcon}>
                    <div className="p-6 bg-pink-50 rounded-[35px] border-4 border-white shadow-inner mb-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-4xl font-black text-pink-400">LV.{userStats.level || 1}</div>
                                <div className="text-[10px] font-bold opacity-50 uppercase">å½“å‰æˆé•¿ç­‰çº§</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-600">{userStats.bamboo || 0} ðŸŽ‹</div>
                                <div className="text-[10px] font-bold opacity-50 uppercase">ç«¹å­åº“å­˜</div>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden border-2 border-white">
                            <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${Math.min(100, ((userStats.xp || 0) / ((userStats.level || 1) * 100)) * 100)}%` }}></div>
                        </div>
                        <div className="text-[10px] font-bold opacity-40 mt-3 text-center uppercase tracking-widest">è·ç¦»ä¸‹æ¬¡å‡çº§è¿˜æœ‰å¾ˆå¤šç«¹å­å–µï¼</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border-2 border-pink-50 text-center">
                            <div className="text-xl font-bold text-pink-400">{userStats.hugs || 0}</div>
                            <div className="text-[9px] opacity-40 font-bold uppercase">æ”¶åˆ°æŠ±æŠ±</div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border-2 border-pink-50 text-center">
                            <div className="text-xl font-bold text-pink-400">{userStats.kisses || 0}</div>
                            <div className="text-[9px] opacity-40 font-bold uppercase">æ”¶åˆ°äº²äº²</div>
                        </div>
                    </div>
                </LuxuryCard>

                {/* AI & Config Cards */}
                <LuxuryCard title="æ™ºèƒ½å¤§è„‘" icon={Activity}>
                    <div className="flex flex-col gap-4">
                        {['GEMINI', 'GROQ'].map(e => (
                            <div 
                                key={e}
                                onClick={() => updateConfig('aiEngine', e)}
                                className={`p-8 rounded-[30px] border-4 transition-all cursor-pointer ${guildConfig.aiEngine === e ? 'bg-pink-50 border-pink-200' : 'bg-transparent border-transparent hover:bg-pink-50/50'}`}
                            >
                                <div className="font-bold text-xl text-gray-700">{e === 'GEMINI' ? 'âœ¨ èªæ˜Žç‰ˆ' : 'âš¡ æžé€Ÿç‰ˆ'}</div>
                                <div className="text-[10px] opacity-50 font-bold uppercase">{e === 'GEMINI' ? 'æ›´æœ‰æ™ºæ…§ï¼Œèƒ½é™ªæ‚¨èŠå¾ˆä¹…' : 'ç§’å›žæ¶ˆæ¯ï¼Œæœ€é€‚åˆæ€¥æ€§å­'}</div>
                            </div>
                        ))}
                    </div>
                </LuxuryCard>

                <LuxuryCard title="åŠŸèƒ½æ¨¡å—" icon={Activity}>
                    <LuxuryToggle label="AI äº¤è°ˆ ðŸ’¬" value={guildConfig.aiModule || 'ENABLED'} onToggle={(v) => updateConfig('aiModule', v)} />
                    <LuxuryToggle label="éŸ³ä¹æ’­æ”¾ ðŸŽµ" value={guildConfig.musicModule || 'ENABLED'} onToggle={(v) => updateConfig('musicModule', v)} />
                    <LuxuryToggle label="ç»æµŽç³»ç»Ÿ ðŸŽ" value={guildConfig.economyModule || 'ENABLED'} onToggle={(v) => updateConfig('economyModule', v)} />
                </LuxuryCard>

                <LuxuryCard title="è‡³å°Šè‹±é›„æ¦œ ðŸ†" icon={Activity}>
                    <div className="flex flex-col gap-4">
                        {leaderboard.map((u, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-5 rounded-[25px] border-2 border-pink-50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-black opacity-20">#{i+1}</span>
                                    <span className="font-bold text-gray-700">{u.nickname || 'ç¥žç§˜ç†ŠçŒ«'}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-pink-400 font-bold">LV. {u.level}</div>
                                    <div className="text-[9px] opacity-30 font-bold">{u.xp} XP</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </LuxuryCard>

                <LuxuryCard title="è‡³å°ŠæœåŠ¡è®¾ç½® âœ¨" icon={Settings}>
                    <div className="flex flex-col gap-6">
                        <div className="form-group">
                            <label className="label-mini">ä¸»äººçš„æŒ‡ä»¤æš—å· (Bot Prefix)</label>
                            <input 
                                className="input-clean text-2xl font-bold py-6 border-pink-100 bg-white/50" 
                                placeholder="!"
                                defaultValue={guildConfig.prefix || '!'}
                                onBlur={(e) => updateConfig('prefix', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-mini">AI èŠå¤©ä¸“å±žé¢‘é“ ID</label>
                            <input 
                                className="input-clean text-sm font-mono py-6 border-pink-100 bg-white/50" 
                                placeholder="åœ¨è¿™é‡Œç²˜è´´é¢‘é“ ID å–µ..."
                                defaultValue={guildConfig.aiChannelId || ''}
                                onBlur={(e) => updateConfig('aiChannelId', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-mini">å›¢å›¢åœ¨æœåŠ¡å™¨çš„å°å¤–å·</label>
                            <input 
                                className="input-clean text-2xl font-bold py-6 border-pink-100 bg-white/50" 
                                placeholder="å›¢å›¢"
                                defaultValue={guildConfig.nickname || ''}
                                onBlur={(e) => updateConfig('nickname', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-mini">团团的大脑引擎 (AI Provider)</label>
                            <select
                                className="input-clean text-sm font-bold py-5 border-pink-100 bg-white/50"
                                value={(guildConfig.aiEngine || "GEMINI").toUpperCase()}
                                onChange={(e) => updateConfig('aiEngine', e.target.value)}
                            >
                                <option value="GEMINI">Gemini</option>
                                <option value="GROQ">Groq</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-pink-100/50 py-5 rounded-3xl text-[11px] font-bold text-pink-500 hover:bg-pink-100 transition-all uppercase">åˆ·æ–°ç¼“å­˜ ðŸ¾</button>
                            <button className="bg-red-50 py-5 rounded-3xl text-[11px] font-bold text-red-500 hover:bg-red-100 transition-all uppercase">æ¸…ç†å†…å­˜ ðŸ®</button>
                        </div>
                    </div>
                </LuxuryCard>

                <LuxuryCard title="è‡³å°Šæ¿€æ´» ðŸ’Ž" icon={Activity}>
                     <div className="p-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-[40px] text-white shadow-lg">
                         <h4 className="text-xl font-bold mb-1">å‡çº§ Supreme+ </h4>
                         <p className="text-[10px] opacity-80 font-bold uppercase mb-6">è§£é” 1.5x ç»éªŒä¸Žé«˜çº§ AI å¼•æ“Ž</p>
                         <input 
                            className="w-full bg-white/20 border-2 border-white/30 rounded-2xl p-4 text-white placeholder-white/60 mb-4 outline-none focus:bg-white/30" 
                            placeholder="è¾“å…¥ç§˜é’¥å–µ..."
                            value={premiumKey}
                            onChange={(e) => setPremiumKey(e.target.value)}
                         />
                         <button
  disabled={busy || !premiumKey.trim()}
  onClick={redeemFromWeb}
  className="w-full bg-white text-pink-500 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100"
>
  确认激活 (兑换码)
</button>

<div className="mt-4 grid grid-cols-2 gap-3">
  <button
    disabled={busy}
    onClick={() => startCheckout("monthly")}
    className="bg-white/15 border-2 border-white/25 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[2px] hover:bg-white/25 transition-all disabled:opacity-60"
  >
    月付开通
  </button>
  <button
    disabled={busy}
    onClick={() => startCheckout("lifetime")}
    className="bg-white/15 border-2 border-white/25 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[2px] hover:bg-white/25 transition-all disabled:opacity-60"
  >
    永久买断
  </button>
</div>
                     </div>
                </LuxuryCard>
                </>
            )}
        </div>
        <div className="mt-auto p-8 opacity-20 text-[10px] font-bold uppercase tracking-[6px] text-center">
            Panda Cloud Sync Â· v7.0.0 Â· Designed by godking512
        </div>
      </div>
    </div>
  );
};

export default App;
