import React, { useState, useEffect } from "react";
import { 
  Plus, LogOut, Activity, Settings,
  Database, User as UserIcon, MessageSquare, Hash, Award, Globe
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithPopup, OAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

// Firebase Config
const firebaseConfig = {
  projectId: "tuantuanbot-28647",
  appId: "1:372694962939:web:888b767d62eef744f2565e",
  storageBucket: "tuantuanbot-28647.firebasestorage.app",
  apiKey: "AIzaSyBvqS8HIJ-yacn_YQfGt49Pb6IVpXw4igE",
  authDomain: "tuantuanbot-28647.firebaseapp.com",
  messagingSenderId: "372694962939",
  measurementId: "G-2MYN99G2KZ"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const DISCORD_PROVIDER_ID = import.meta.env.VITE_DISCORD_PROVIDER_ID || 'oidc.discord';
const provider = new OAuthProvider(DISCORD_PROVIDER_ID);
provider.addScope('identify');
provider.addScope('guilds');

// Translations
const t = {
  ZH: {
    heroTitle: "团团的小屋",
    heroSubtitle: "“ 团团会一直陪着主人哒！🌸 ”",
    btnOpen: "开启小屋 🐾",
    btnInvite: "找团团玩 🎟️",
    selectServer: "请在左边选一个服务器，让团团为您效劳吧！🐾",
    statusReport: "团团的状态报告",
    family: "大家庭 🏠",
    welcome: "欢迎光临团团的控制中心喵~",
    supremeWelcome: "🏆 尊贵的至尊服务器 · Supreme+ 激活码生效中 ✨",
    cuteMaster: "最可爱的小主人 💖",
    supremeMaster: "至尊熊猫金主 💎",
    pandaStats: "我的熊猫数据",
    currentLevel: "当前成长等级",
    bambooP: "竹子库存",
    upgradeNotice: "距离下次升级还有很多竹子喵！",
    hugs: "收到抱抱",
    kisses: "收到亲亲",
    brain: "智能大脑",
    geminiTitle: "✨ 聪明版",
    geminiDesc: "更有智慧，能陪您聊很久",
    groqTitle: "⚡ 极速版",
    groqDesc: "秒回消息，最适合急性子",
    features: "功能模块",
    aiChat: "AI 交谈 💬",
    music: "音乐播放 🎵",
    economy: "经济系统 🎁",
    leaderboard: "至尊英雄榜 🏆",
    settings: "至尊服务设置 ✨",
    prefixLabel: "主人的指令暗号 (Bot Prefix)",
    aiChannelLabel: "AI 聊天专属频道 ID",
    aiChannelPlaceholder: "在这里粘贴频道 ID 喵...",
    nicknameLabel: "团团在服务器的小外号",
    engineLabel: "团团的大脑引擎 (AI Provider)",
    btnClearCache: "刷新缓存 🐾",
    btnClearRam: "清理内存 🍔",
    supremeActivation: "至尊激活 💎",
    supremeUpgrade: "升级 Supreme+",
    supremeUnlock: "解锁 1.5x 经验与高级 AI 引擎",
    inputKey: "输入秘钥喵...",
    btnActivate: "确认激活 (兑换码)",
    btnMonthly: "月付开通",
    btnLifetime: "永久买断",
    alertSuccess: "激活成功，团团吃到黄金竹子啦。"
  },
  EN: {
    heroTitle: "TuanTuan's Hub",
    heroSubtitle: "\"TuanTuan will always be with you! 🌸\"",
    btnOpen: "Open Hub 🐾",
    btnInvite: "Invite TuanTuan 🎟️",
    selectServer: "Please select a server on the left to let TuanTuan serve you! 🐾",
    statusReport: "TuanTuan's Status",
    family: "Servers Family 🏠",
    welcome: "Welcome to TuanTuan's Control Center meow~",
    supremeWelcome: "🏆 Supreme Server · Supreme+ active ✨",
    cuteMaster: "Cutest Master 💖",
    supremeMaster: "Supreme Panda Patron 💎",
    pandaStats: "My Panda Stats",
    currentLevel: "Current Level",
    bambooP: "Bamboo Points",
    upgradeNotice: "Keep collecting bamboo to level up!",
    hugs: "Hugs Received",
    kisses: "Kisses Received",
    brain: "AI Brain Engine",
    geminiTitle: "✨ Smart Mode",
    geminiDesc: "More intelligent, great for deep chats",
    groqTitle: "⚡ Fast Mode",
    groqDesc: "Instant replies, for impatient ones",
    features: "Feature Modules",
    aiChat: "AI Chat 💬",
    music: "Music Player 🎵",
    economy: "Economy 🎁",
    leaderboard: "Supreme Leaderboard 🏆",
    settings: "Supreme Settings ✨",
    prefixLabel: "Bot Command Prefix",
    aiChannelLabel: "AI Chat Channel ID",
    aiChannelPlaceholder: "Paste Channel ID here...",
    nicknameLabel: "TuanTuan's Nickname",
    engineLabel: "AI Provider Engine",
    btnClearCache: "Clear Cache 🐾",
    btnClearRam: "Clear RAM 🍔",
    supremeActivation: "Supreme Activation 💎",
    supremeUpgrade: "Upgrade to Supreme+",
    supremeUnlock: "Unlock 1.5x XP and Premium AI logic",
    inputKey: "Enter license key...",
    btnActivate: "Activate Key",
    btnMonthly: "Monthly",
    btnLifetime: "Lifetime",
    alertSuccess: "Activated successfully, TuanTuan got the golden bamboo!"
  }
};

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
  const [lang, setLang] = useState("ZH");
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
  const l = t[lang];

  useEffect(() => {
    // 监听 URL Hash 处理登录回调
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        localStorage.setItem("dc_token", token);
        window.location.hash = ""; // 清理 URL
        fetchDiscordUser(token);
      }
    } else {
      const savedToken = localStorage.getItem("dc_token");
      if (savedToken) fetchDiscordUser(savedToken);
    }
  }, []);

  const fetchDiscordUser = async (token) => {
    try {
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      if (userData.id) {
        setAuthUser({
           uid: userData.id,
           displayName: userData.username,
           photoURL: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`,
           providerData: [{ uid: userData.id }]
        });
        
        const guildRes = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { authorization: `Bearer ${token}` }
        });
        const list = await guildRes.json();
        const safe = Array.isArray(list) ? list : [];
        setGuilds(safe);
        try { localStorage.setItem("tt_guilds", JSON.stringify(safe)); } catch {}
      } else {
        localStorage.removeItem("dc_token");
      }
    } catch (e) {
      console.error("Discord Fetch Error:", e);
      localStorage.removeItem("dc_token");
    }
  };

  const login = () => {
    const CLIENT_ID = "1481640516931031050";
    // 确保没有结尾的斜杠，防止 Discord 报错
    const origin = window.location.origin.replace(/\/$/, ""); 
    const REDIRECT_URI = encodeURIComponent(origin);
    const SCOPES = encodeURIComponent("identify guilds");
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES}`;
  };

  useEffect(() => {
    if (!selectedGuild) return;
    const unsubConfig = onSnapshot(doc(firestore, "guilds", selectedGuild.id), (doc) => {
      if (doc.exists()) setGuildConfig(doc.data());
    });

    if (authUser?.uid) {
        const discordId = authUser.uid; // 修正为直接使用 uid
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

  const updateConfig = async (key, val) => {
    if (!selectedGuild) return;
    await setDoc(doc(firestore, "guilds", selectedGuild.id), { [key]: val }, { merge: true });
  };

  const toggleLang = () => {
    setLang(lang === "ZH" ? "EN" : "ZH");
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
      alert(l.alertSuccess);
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
        <div className="absolute top-10 right-10 flex cursor-pointer items-center gap-2 bg-pink-100 px-6 py-3 rounded-full text-pink-500 font-bold hover:scale-105 transition-transform" onClick={toggleLang}>
            <Globe size={18} /> {lang === "ZH" ? "English" : "中文"}
        </div>
        <div className="landing-hero">
            <img src="/panda-mascot.png" className="w-[180px] h-[180px] mx-auto animate-bounce object-contain pointer-events-none select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} alt="Mascot" />
            <h1 className="text-7xl font-bold" dangerouslySetInnerHTML={{ __html: lang === 'ZH' ? '团团 <span>小屋</span>' : 'TuanTuan <span>Hub</span>' }}></h1>
            <p className="text-lg font-medium opacity-60 mt-4 italic">{l.heroSubtitle}</p>
            <p className="text-[10px] font-bold opacity-30 mt-6 uppercase tracking-[4px]">Elite Hub v7.0 · Designed by godking512</p>
            <div className="mt-12 flex gap-8">
                <button onClick={login} className="btn-premium-cta !px-12 text-lg">{l.btnOpen}</button>
                <button onClick={inviteBot} className="btn-premium-cta !px-12 bg-transparent border-2 border-pink-400 !text-pink-400 shadow-none hover:bg-pink-400/10">{l.btnInvite}</button>
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
            <img src="/panda-mascot.png" className="w-16 h-16 pointer-events-none select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} alt="Logo" />
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
                <h1>{selectedGuild ? selectedGuild.name : l.family}</h1>
                <p>{selectedGuild && guildConfig.isPremium ? l.supremeWelcome : l.welcome}</p>
            </div>
            
            <div className="flex items-center gap-10">
                <div className="cursor-pointer bg-white px-5 py-2 rounded-2xl shadow-sm border border-pink-100 flex items-center gap-2 text-pink-500 font-bold hover:bg-pink-50 transition-colors" onClick={toggleLang}>
                    <Globe size={18} /> {lang}
                </div>
                <div className="flex items-center bg-white p-3 rounded-full border-2 border-pink-100 gap-6 pr-8 shadow-sm">
                    <div className="relative">
                        <img src={authUser.photoURL} className="w-12 h-12 rounded-full border-2 border-pink-300" />
                        <div className="absolute -bottom-1 -right-1 bg-green-400 w-4 h-4 rounded-full border-2 border-white animate-pulse" title="Cloud Active"></div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-700">{authUser.displayName}</div>
                        <div className="text-[10px] text-pink-400 font-bold uppercase flex items-center gap-2">
                             <Sparkles size={10} /> {guildConfig.isPremium ? l.supremeMaster : l.cuteMaster}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="view-port">
            {!selectedGuild ? (
                <LuxuryCard title={l.statusReport} icon={Activity}>
                    <div className="flex flex-col items-center">
                        <img src="/hero-scene.png" className="w-[80%] rounded-[40px] shadow-xl mb-8 pointer-events-none select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} alt="Scene" />
                        <p className="text-lg font-bold opacity-40 text-center px-10">{l.selectServer}</p>
                    </div>
                </LuxuryCard>
            ) : (
                <>
                {/* User Stats Card */}
                <LuxuryCard title={l.pandaStats} icon={UserIcon}>
                    <div className="p-6 bg-pink-50 rounded-[35px] border-4 border-white shadow-inner mb-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-4xl font-black text-pink-400">LV.{userStats.level || 1}</div>
                                <div className="text-[10px] font-bold opacity-50 uppercase">{l.currentLevel}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-600">{userStats.bamboo || 0} 🎋</div>
                                <div className="text-[10px] font-bold opacity-50 uppercase">{l.bambooP}</div>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden border-2 border-white">
                            <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${Math.min(100, ((userStats.xp || 0) / ((userStats.level || 1) * 250)) * 100)}%` }}></div>
                        </div>
                        <div className="text-[10px] font-bold opacity-40 mt-3 text-center uppercase tracking-widest">{l.upgradeNotice}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border-2 border-pink-50 text-center">
                            <div className="text-xl font-bold text-pink-400">{userStats.hugs || 0}</div>
                            <div className="text-[9px] opacity-40 font-bold uppercase">{l.hugs}</div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border-2 border-pink-50 text-center">
                            <div className="text-xl font-bold text-pink-400">{userStats.kisses || 0}</div>
                            <div className="text-[9px] opacity-40 font-bold uppercase">{l.kisses}</div>
                        </div>
                    </div>
                </LuxuryCard>

                {/* AI & Config Cards */}
                <LuxuryCard title={l.brain} icon={Activity}>
                    <div className="flex flex-col gap-4">
                        {['GEMINI', 'GROQ'].map(e => (
                            <div 
                                key={e}
                                onClick={() => updateConfig('aiEngine', e)}
                                className={`p-8 rounded-[30px] border-4 transition-all cursor-pointer ${guildConfig.aiEngine === e ? 'bg-pink-50 border-pink-200' : 'bg-transparent border-transparent hover:bg-pink-50/50'}`}
                            >
                                <div className="font-bold text-xl text-gray-700">{e === 'GEMINI' ? l.geminiTitle : l.groqTitle}</div>
                                <div className="text-[10px] opacity-50 font-bold uppercase">{e === 'GEMINI' ? l.geminiDesc : l.groqDesc}</div>
                            </div>
                        ))}
                    </div>
                </LuxuryCard>

                <LuxuryCard title={l.features} icon={Activity}>
                    <LuxuryToggle label={l.aiChat} value={guildConfig.aiModule || 'ENABLED'} onToggle={(v) => updateConfig('aiModule', v)} />
                    <LuxuryToggle label={l.music} value={guildConfig.musicModule || 'ENABLED'} onToggle={(v) => updateConfig('musicModule', v)} />
                    <LuxuryToggle label={l.economy} value={guildConfig.economyModule || 'ENABLED'} onToggle={(v) => updateConfig('economyModule', v)} />
                </LuxuryCard>

                <LuxuryCard title={l.leaderboard} icon={Activity}>
                    <div className="flex flex-col gap-4">
                        {leaderboard.map((u, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-5 rounded-[25px] border-2 border-pink-50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-black opacity-20">#{i+1}</span>
                                    <span className="font-bold text-gray-700">{u.nickname || 'Unknown'}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-pink-400 font-bold">LV. {u.level}</div>
                                    <div className="text-[9px] opacity-30 font-bold">{u.xp} XP</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </LuxuryCard>

                <LuxuryCard title={l.settings} icon={Settings}>
                    <div className="flex flex-col gap-6">
                        <div className="form-group">
                            <label className="label-mini">{l.prefixLabel}</label>
                            <input 
                                className="input-clean text-2xl font-bold py-6 border-pink-100 bg-white/50" 
                                placeholder="!"
                                defaultValue={guildConfig.prefix || '!'}
                                onBlur={(e) => updateConfig('prefix', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-mini">{l.aiChannelLabel}</label>
                            <input 
                                className="input-clean text-sm font-mono py-6 border-pink-100 bg-white/50" 
                                placeholder={l.aiChannelPlaceholder}
                                defaultValue={guildConfig.aiChannelId || ''}
                                onBlur={(e) => updateConfig('aiChannelId', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-mini">{l.nicknameLabel}</label>
                            <input 
                                className="input-clean text-2xl font-bold py-6 border-pink-100 bg-white/50" 
                                placeholder="TuanTuan"
                                defaultValue={guildConfig.nickname || ''}
                                onBlur={(e) => updateConfig('nickname', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-mini">{l.engineLabel}</label>
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
                            <button className="bg-pink-100/50 py-5 rounded-3xl text-[11px] font-bold text-pink-500 hover:bg-pink-100 transition-all uppercase">{l.btnClearCache}</button>
                            <button className="bg-red-50 py-5 rounded-3xl text-[11px] font-bold text-red-500 hover:bg-red-100 transition-all uppercase">{l.btnClearRam}</button>
                        </div>
                    </div>
                </LuxuryCard>

                <LuxuryCard title={l.supremeActivation} icon={Activity}>
                     <div className="p-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-[40px] text-white shadow-lg">
                         <h4 className="text-xl font-bold mb-1">{l.supremeUpgrade}</h4>
                         <p className="text-[10px] opacity-80 font-bold uppercase mb-6">{l.supremeUnlock}</p>
                         <input 
                            className="w-full bg-white/20 border-2 border-white/30 rounded-2xl p-4 text-white placeholder-white/60 mb-4 outline-none focus:bg-white/30" 
                            placeholder={l.inputKey}
                            value={premiumKey}
                            onChange={(e) => setPremiumKey(e.target.value)}
                         />
                         <button
                            disabled={busy || !premiumKey.trim()}
                            onClick={redeemFromWeb}
                            className="w-full bg-white text-pink-500 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100"
                          >
                           {l.btnActivate}
                          </button>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button disabled={busy} onClick={() => startCheckout("monthly")} className="bg-white/15 border-2 border-white/25 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[2px] hover:bg-white/25 transition-all disabled:opacity-60">{l.btnMonthly}</button>
                            <button disabled={busy} onClick={() => startCheckout("lifetime")} className="bg-white/15 border-2 border-white/25 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[2px] hover:bg-white/25 transition-all disabled:opacity-60">{l.btnLifetime}</button>
                          </div>
                     </div>
                </LuxuryCard>
                </>
            )}
        </div>
        <div className="mt-auto p-8 opacity-20 text-[10px] font-bold uppercase tracking-[6px] text-center">
            Panda Cloud Sync · v7.0.0 · Designed by godking512
        </div>
      </div>
    </div>
  );
};

export default App;
