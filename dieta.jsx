import { useState, useEffect, useRef, useCallback } from "react";

const DAYS_IT = ["DOMENICA","LUNEDI","MARTEDI","MERCOLEDI","GIOVEDI","VENERDI","SABATO"];

const TARGETS = {
  LUNEDI:    { label: "Pochi carboidrati", kcal: 1400, carb: 14, fat: 44, prot: 226, fib: 0 },
  MARTEDI:   { label: "Medi carboidrati", kcal: 1600, carb: 90, fat: 44, prot: 211, fib: 18 },
  MERCOLEDI: { label: "Molti carboidrati", kcal: 2000, carb: 289, fat: 21, prot: 164, fib: 41 },
  GIOVEDI:   { label: "Pochi carboidrati", kcal: 1400, carb: 14, fat: 44, prot: 226, fib: 0 },
  VENERDI:   { label: "Medi carboidrati", kcal: 1600, carb: 90, fat: 44, prot: 211, fib: 18 },
  SABATO:    { label: "Medi carboidrati", kcal: 1600, carb: 90, fat: 44, prot: 211, fib: 18 },
  DOMENICA:  { label: "Molti carboidrati", kcal: 2000, carb: 289, fat: 21, prot: 164, fib: 41 },
};

const DEFAULT_FOODS = [
  { id:"f1", name:"Olio (1 cucchiaio)", kcal:50, carb:0, fat:5.5, prot:0, fib:0, portion:"1 cucchiaio" },
  { id:"f2", name:"Salsa di soia (1 cucchiaio)", kcal:10, carb:0.5, fat:0, prot:1.5, fib:0, portion:"1 cucchiaio" },
  { id:"f3", name:"Latte di riso (100ml)", kcal:65, carb:14, fat:0.8, prot:0.3, fib:0.2, portion:"100 ml" },
  { id:"f4", name:"Latte di cocco (100g)", kcal:220, carb:4, fat:22, prot:0, fib:0, portion:"100 g" },
  { id:"f5", name:"Dado vegetale", kcal:10, carb:1, fat:0, prot:1, fib:0, portion:"1 dado" },
  { id:"f6", name:"Olive nere (10)", kcal:30, carb:3, fat:3, prot:0, fib:0, portion:"10 olive" },
  { id:"f7", name:"Mandorle (10)", kcal:60, carb:1, fat:5, prot:2, fib:1, portion:"10 mandorle" },
  { id:"f8", name:"Noci (8 quarti / 10g)", kcal:70, carb:0, fat:10, prot:0, fib:0, portion:"10 g" },
  { id:"f9", name:"Uovo sodo", kcal:80, carb:0, fat:5, prot:12, fib:0, portion:"1 uovo" },
  { id:"f10", name:"Super Burger Valsoia (115g)", kcal:230, carb:13, fat:12, prot:18, fib:0, portion:"115 g" },
  { id:"f11", name:"Burger Valsoia base", kcal:130, carb:5, fat:5, prot:15, fib:4, portion:"1 burger" },
  { id:"f12", name:"Burger Findus Green Cuisine (100g)", kcal:200, carb:4, fat:16, prot:13, fib:6, portion:"100 g" },
  { id:"f13", name:"Burger Amadori (100g)", kcal:180, carb:5, fat:10, prot:16, fib:0, portion:"100 g" },
  { id:"f14", name:"Seitan (100g)", kcal:125, carb:11, fat:1, prot:0, fib:0, portion:"100 g" },
  { id:"f15", name:"Burger Heura (115g)", kcal:180, carb:6, fat:10, prot:0, fib:0, portion:"115 g" },
  { id:"f16", name:"Salsiccia Heura (100g / 2 salsicce)", kcal:150, carb:4, fat:7, prot:14, fib:5, portion:"100 g" },
  { id:"f17", name:"Polpette Valsoia", kcal:600, carb:10, fat:6, prot:0, fib:0, portion:"1 conf" },
  { id:"f18", name:"Tofu (100g)", kcal:120, carb:1.5, fat:7, prot:14, fib:0, portion:"100 g" },
  { id:"f19", name:"Tofu affumicato (100g)", kcal:170, carb:2.5, fat:9, prot:19, fib:0, portion:"100 g" },
  { id:"f20", name:"Affettati Mopur prosc. cotto (90g)", kcal:270, carb:10, fat:8, prot:33, fib:5, portion:"90 g" },
  { id:"f21", name:"Tonno Vuna (100g / mezzo baratt.)", kcal:280, carb:2, fat:20, prot:22, fib:0.7, portion:"100 g" },
  { id:"f22", name:"Fontina (100g)", kcal:390, carb:2, fat:30, prot:25, fib:0, portion:"100 g" },
  { id:"f23", name:"Verdure (100g)", kcal:100, carb:4, fat:0, prot:0, fib:0, portion:"100 g" },
  { id:"f24", name:"Cipolla (100g)", kcal:40, carb:10, fat:0, prot:0, fib:0, portion:"100 g" },
  { id:"f25", name:"Funghi (100g)", kcal:150, carb:4, fat:0.5, prot:0, fib:0, portion:"100 g" },
  { id:"f26", name:"Pasta all'uovo (100g)", kcal:370, carb:65, fat:5, prot:15, fib:0, portion:"100 g" },
  { id:"f27", name:"Lenticchie (100g)", kcal:360, carb:63, fat:2, prot:0, fib:0, portion:"100 g" },
  { id:"f28", name:"Patate (100g)", kcal:75, carb:16, fat:0, prot:2, fib:0, portion:"100 g" },
  { id:"f29", name:"Yogurt Soysun", kcal:100, carb:8, fat:0, prot:0, fib:0, portion:"1 vasetto" },
  { id:"f30", name:"Vino rosso (1 bicchiere)", kcal:80, carb:3, fat:0, prot:0, fib:0, portion:"1 bicchiere" },
  { id:"f31", name:"Birra Chouffe (33cl)", kcal:250, carb:20, fat:0, prot:0, fib:0, portion:"33 cl" },
];

const dateKey = (d) => d.toISOString().slice(0,10);
const todayKey = () => dateKey(new Date());
const dayName = (d) => DAYS_IT[new Date(d+"T12:00:00").getDay()];
const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const formatDate = (dk) => { const d = new Date(dk+"T12:00:00"); return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`; };

// Storage helpers
const store = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; }},
  async set(k,v) { try { await window.storage.set(k, JSON.stringify(v)); } catch(e) { console.error(e); }},
};

export default function App() {
  const [view, setView] = useState("home"); // home, add, addNew, scan, history
  const [foods, setFoods] = useState(DEFAULT_FOODS);
  const [log, setLog] = useState([]); // today's log [{foodId, name, kcal, carb, fat, prot, fib, qty}]
  const [currentDate, setCurrentDate] = useState(todayKey());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanProcessing, setScanProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [statsRange, setStatsRange] = useState("week"); // week, month
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const fileRef = useRef();

  // New food form
  const [nf, setNf] = useState({ name:"", kcal:"", carb:"", fat:"", prot:"", fib:"", portion:"" });

  // Load data
  useEffect(() => {
    (async () => {
      const savedFoods = await store.get("foods_v2");
      if (savedFoods) setFoods(savedFoods);
      const savedLog = await store.get("log_" + currentDate);
      if (savedLog) setLog(savedLog);
      const savedKey = await store.get("api_key");
      if (savedKey) setApiKey(savedKey);
      setLoading(false);
    })();
  }, []);

  // Load log when date changes
  useEffect(() => {
    (async () => {
      const savedLog = await store.get("log_" + currentDate);
      setLog(savedLog || []);
    })();
  }, [currentDate]);

  // Save log
  const saveLog = useCallback(async (newLog) => {
    setLog(newLog);
    await store.set("log_" + currentDate, newLog);
    // Also track this date in history
    const hist = (await store.get("history_dates")) || [];
    if (!hist.includes(currentDate)) {
      hist.push(currentDate);
      await store.set("history_dates", hist);
    }
  }, [currentDate]);

  // Totals
  const totals = log.reduce((a, e) => ({
    kcal: a.kcal + (e.kcal * e.qty), carb: a.carb + (e.carb * e.qty),
    fat: a.fat + (e.fat * e.qty), prot: a.prot + (e.prot * e.qty), fib: a.fib + (e.fib * e.qty),
  }), { kcal:0, carb:0, fat:0, prot:0, fib:0 });

  const target = TARGETS[dayName(currentDate)] || TARGETS.MARTEDI;

  const addFood = (food, qty = 1) => {
    const entry = { id: Date.now(), foodId: food.id, name: food.name, kcal: food.kcal, carb: food.carb, fat: food.fat, prot: food.prot, fib: food.fib, qty };
    const nl = [...log, entry];
    saveLog(nl);
    setView("home");
    setSearch("");
  };

  const removeEntry = (id) => {
    saveLog(log.filter(e => e.id !== id));
  };

  const startEdit = (e) => { setEditingId(e.id); setEditName(e.name); };
  const confirmEdit = async () => {
    if (editingId && editName.trim()) {
      const entry = log.find(e => e.id === editingId);
      saveLog(log.map(e => e.id === editingId ? { ...e, name: editName.trim() } : e));
      // Also update master food list
      if (entry?.foodId) {
        const nFoods = foods.map(f => f.id === entry.foodId ? { ...f, name: editName.trim() } : f);
        setFoods(nFoods);
        await store.set("foods_v2", nFoods);
      }
    }
    setEditingId(null);
  };

  // Stats: load multiple days
  const [statsData, setStatsData] = useState([]);
  const loadStats = useCallback(async () => {
    const days = [];
    const count = statsRange === "week" ? 7 : 30;
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dk = dateKey(d);
      const dayLog = await store.get("log_" + dk);
      const dn = dayName(dk);
      const t = TARGETS[dn] || TARGETS.MARTEDI;
      const tot = (dayLog || []).reduce((a, e) => ({
        kcal: a.kcal + e.kcal * e.qty, carb: a.carb + e.carb * e.qty,
        fat: a.fat + e.fat * e.qty, prot: a.prot + e.prot * e.qty, fib: a.fib + e.fib * e.qty,
      }), { kcal:0, carb:0, fat:0, prot:0, fib:0 });
      days.push({ date: dk, day: dn.slice(0,3), target: t, totals: tot, hasData: dayLog && dayLog.length > 0 });
    }
    setStatsData(days);
  }, [statsRange]);

  useEffect(() => { if (view === "stats") loadStats(); }, [statsRange, view, loadStats]);

  const saveNewFood = async () => {
    const food = {
      id: "u" + Date.now(),
      name: nf.name,
      kcal: parseFloat(nf.kcal) || 0,
      carb: parseFloat(nf.carb) || 0,
      fat: parseFloat(nf.fat) || 0,
      prot: parseFloat(nf.prot) || 0,
      fib: parseFloat(nf.fib) || 0,
      portion: nf.portion || "1 porzione",
    };
    const nFoods = [...foods, food];
    setFoods(nFoods);
    await store.set("foods_v2", nFoods);
    addFood(food);
    setNf({ name:"", kcal:"", carb:"", fat:"", prot:"", fib:"", portion:"" });
    setView("home");
  };

  // Camera / OCR via Claude API
  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setScanProcessing(true);
    setScanResult(null);
    setView("scan");

    try {
      if (!apiKey) {
        setScanResult({ error: true, detail: "API key non configurata. Vai nelle impostazioni (⚙) per inserirla." });
        setScanProcessing(false);
        return;
      }

      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("read fail"));
        r.readAsDataURL(file);
      });

      const mediaType = file.type || "image/jpeg";

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
              { type: "text", text: `Questa è la tabella nutrizionale di un prodotto alimentare. Estrai i valori nutrizionali e rispondi SOLO con un JSON valido (senza backtick markdown) con questi campi esatti:
{"name": "nome del prodotto se visibile, altrimenti 'Prodotto scansionato'", "kcal": numero calorie per porzione o per 100g, "carb": carboidrati in grammi, "fat": grassi in grammi, "prot": proteine in grammi, "fib": fibre in grammi, "portion": "porzione di riferimento es. '100 g' o '1 porzione (25g)'"}
Se non riesci a leggere un valore, metti 0.` }
            ]
          }]
        })
      });

      const data = await resp.json();
      if (data.error) {
        setScanResult({ error: true, detail: data.error.message || JSON.stringify(data.error) });
        setScanProcessing(false);
        return;
      }
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setScanResult(parsed);
    } catch (err) {
      console.error(err);
      setScanResult({ error: true, detail: err.message });
    }
    setScanProcessing(false);
  };

  const saveScanResult = async () => {
    if (!scanResult || scanResult.error) return;
    const food = {
      id: "s" + Date.now(),
      name: scanResult.name || "Prodotto scansionato",
      kcal: parseFloat(scanResult.kcal) || 0,
      carb: parseFloat(scanResult.carb) || 0,
      fat: parseFloat(scanResult.fat) || 0,
      prot: parseFloat(scanResult.prot) || 0,
      fib: parseFloat(scanResult.fib) || 0,
      portion: scanResult.portion || "1 porzione",
    };
    const nFoods = [...foods, food];
    setFoods(nFoods);
    await store.set("foods_v2", nFoods);
    addFood(food);
    setScanResult(null);
  };

  // Date nav
  const shiftDate = (days) => {
    const d = new Date(currentDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setCurrentDate(dateKey(d));
  };

  const isToday = currentDate === todayKey();

  // Pct helper
  const pct = (val, max) => max > 0 ? Math.min((val / max) * 100, 100) : 0;
  const over = (val, max) => val > max;

  const filtered = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={S.loadWrap}><div style={S.spinner}/></div>;

  // ── STYLES ──
  const accent = "#E8572A";
  const bg = "#0D0D0D";
  const card = "#1A1A1A";
  const card2 = "#242424";
  const text1 = "#F0EDE6";
  const text2 = "#8A8780";
  const green = "#4CAF50";
  const red = "#E8572A";

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text1, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", maxWidth: 430, margin: "0 auto", paddingBottom: 100, WebkitFontSmoothing: "antialiased" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* ── HOME ── */}
      {view === "home" && <>
        {/* Date nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 8px" }}>
          <button onClick={() => shiftDate(-1)} style={S.navBtn}>◂</button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:13, color: text2, fontFamily:"'DM Mono', monospace", letterSpacing:1 }}>{dayName(currentDate)}</div>
            <div style={{ fontSize:18, fontWeight:700 }}>{isToday ? "Oggi" : formatDate(currentDate)}</div>
            <div style={{ fontSize:11, color: accent, fontWeight:600, marginTop:2 }}>{target.label.toUpperCase()}</div>
          </div>
          <button onClick={() => shiftDate(1)} style={S.navBtn}>▸</button>
          <button onClick={() => { setApiKeyInput(apiKey); setView("settings"); }} style={{ ...S.navBtn, fontSize:18 }}>⚙</button>
        </div>

        {/* Macro summary */}
        <div style={{ padding:"12px 20px" }}>
          {/* Kcal ring */}
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
            <div style={{ position:"relative", width:90, height:90, flexShrink:0 }}>
              <svg viewBox="0 0 100 100" style={{ width:90, height:90, transform:"rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke={card2} strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke={over(totals.kcal, target.kcal) ? red : green} strokeWidth="8"
                  strokeDasharray={`${pct(totals.kcal, target.kcal) * 2.639} 264`} strokeLinecap="round"
                  style={{ transition:"stroke-dasharray 0.5s ease" }}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:20, fontWeight:700, fontFamily:"'DM Mono', monospace", color: over(totals.kcal, target.kcal) ? red : text1 }}>{Math.round(totals.kcal)}</span>
                <span style={{ fontSize:9, color: text2 }}>/ {target.kcal}</span>
              </div>
            </div>
            <div style={{ flex:1 }}>
              {[
                { label:"Carb", val: totals.carb, max: target.carb, unit:"g", color:"#F4A261" },
                { label:"Grassi", val: totals.fat, max: target.fat, unit:"g", color:"#E76F51" },
                { label:"Proteine", val: totals.prot, max: target.prot, unit:"g", color:"#2A9D8F" },
                { label:"Fibre", val: totals.fib, max: target.fib, unit:"g", color:"#6A9BD1" },
              ].map(m => (
                <div key={m.label} style={{ marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color: text2, marginBottom:2 }}>
                    <span>{m.label}</span>
                    <span style={{ fontFamily:"'DM Mono', monospace", color: over(m.val, m.max) ? red : text1 }}>
                      {Math.round(m.val*10)/10}<span style={{color:text2}}>/{m.max}{m.unit}</span>
                    </span>
                  </div>
                  <div style={{ height:4, background:card2, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width: pct(m.val, m.max)+"%", background: over(m.val, m.max) ? red : m.color, borderRadius:2, transition:"width 0.4s ease" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Food log */}
        <div style={{ padding:"0 20px" }}>
          <div style={{ fontSize:11, color: text2, fontFamily:"'DM Mono', monospace", letterSpacing:1, marginBottom:8 }}>DIARIO</div>
          {log.length === 0 && <div style={{ color: text2, fontSize:14, padding:"20px 0", textAlign:"center" }}>Nessun alimento registrato</div>}
          {log.map(e => (
            <div key={e.id} style={{ display:"flex", alignItems:"center", background:card, borderRadius:12, padding:"12px 14px", marginBottom:6 }}>
              <div style={{ flex:1, minWidth:0 }}>
                {editingId === e.id ? (
                  <input value={editName} onChange={ev => setEditName(ev.target.value)} onBlur={confirmEdit}
                    onKeyDown={ev => ev.key === "Enter" && confirmEdit()} autoFocus
                    style={{ width:"100%", boxSizing:"border-box", background:card2, border:"1px solid #444", borderRadius:6, padding:"6px 8px", color:text1, fontSize:14, fontWeight:500, outline:"none" }}/>
                ) : (
                  <div onClick={() => startEdit(e)} style={{ fontSize:14, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", cursor:"pointer" }}>{e.qty > 1 ? `${e.qty}× ` : ""}{e.name}</div>
                )}
                <div style={{ fontSize:11, color: text2, fontFamily:"'DM Mono', monospace", marginTop:2 }}>
                  {Math.round(e.kcal*e.qty)} kcal · C{Math.round(e.carb*e.qty)} · G{Math.round(e.fat*e.qty)} · P{Math.round(e.prot*e.qty)}
                </div>
              </div>
              <button onClick={() => removeEntry(e.id)} style={{ background:"none", border:"none", color: text2, fontSize:18, padding:"4px 8px", cursor:"pointer" }}>✕</button>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"linear-gradient(transparent, #0D0D0D 30%)", padding:"30px 20px 24px", display:"flex", gap:10 }}>
          <button onClick={() => { setView("stats"); loadStats(); }} style={{ ...S.btn, background: card2, width:52 }} title="Statistiche">
            📊
          </button>
          <button onClick={() => setView("add")} style={{ ...S.btn, flex:1, background: accent }}>
            + Aggiungi alimento
          </button>
          <button onClick={() => fileRef.current?.click()} style={{ ...S.btn, background: card2, width:52 }} title="Scansiona etichetta">
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleScan} style={{ display:"none" }}/>
        </div>
      </>}

      {/* ── ADD FROM LIST ── */}
      {view === "add" && <>
        <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => { setView("home"); setSearch(""); }} style={S.back}>◂</button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca alimento..."
            autoFocus
            style={{ flex:1, background:card, border:"none", borderRadius:10, padding:"12px 14px", color:text1, fontSize:15, outline:"none" }}/>
        </div>
        <div style={{ padding:"8px 20px" }}>
          <button onClick={() => { setView("addNew"); setSearch(""); }} style={{ ...S.btn, background: card2, width:"100%", fontSize:13, marginBottom:10 }}>
            ✎ Aggiungi nuovo alimento manualmente
          </button>
        </div>
        <div style={{ padding:"0 20px", paddingBottom:30 }}>
          {filtered.map(f => (
            <button key={f.id} onClick={() => addFood(f)} style={{ display:"block", width:"100%", textAlign:"left", background:card, border:"none", borderRadius:12, padding:"12px 14px", marginBottom:6, cursor:"pointer" }}>
              <div style={{ fontSize:14, fontWeight:500, color:text1 }}>{f.name}</div>
              <div style={{ fontSize:11, color:text2, fontFamily:"'DM Mono', monospace", marginTop:2 }}>
                {f.kcal} kcal · C{f.carb} · G{f.fat} · P{f.prot} · F{f.fib} — {f.portion}
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div style={{ color: text2, textAlign:"center", padding:20 }}>Nessun risultato</div>}
        </div>
      </>}

      {/* ── ADD NEW FOOD ── */}
      {view === "addNew" && <>
        <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setView("add")} style={S.back}>◂</button>
          <span style={{ fontSize:17, fontWeight:600 }}>Nuovo alimento</span>
        </div>
        <div style={{ padding:"12px 20px" }}>
          {[
            { key:"name", label:"Nome", type:"text", ph:"Es. Pane integrale 100g" },
            { key:"portion", label:"Porzione", type:"text", ph:"Es. 100 g" },
            { key:"kcal", label:"Calorie (kcal)", type:"number" },
            { key:"carb", label:"Carboidrati (g)", type:"number" },
            { key:"fat", label:"Grassi (g)", type:"number" },
            { key:"prot", label:"Proteine (g)", type:"number" },
            { key:"fib", label:"Fibre (g)", type:"number" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, color:text2, display:"block", marginBottom:4 }}>{f.label}</label>
              <input value={nf[f.key]} onChange={e => setNf({...nf, [f.key]: e.target.value})} type={f.type} placeholder={f.ph || "0"}
                style={{ width:"100%", boxSizing:"border-box", background:card, border:"1px solid #333", borderRadius:10, padding:"11px 14px", color:text1, fontSize:15, outline:"none" }}/>
            </div>
          ))}
          <button onClick={saveNewFood} disabled={!nf.name} style={{ ...S.btn, background: accent, width:"100%", marginTop:8, opacity: nf.name ? 1 : 0.4 }}>
            Salva e aggiungi al diario
          </button>
        </div>
      </>}

      {/* ── SCAN RESULT ── */}
      {view === "scan" && <>
        <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => { setView("home"); setScanResult(null); }} style={S.back}>◂</button>
          <span style={{ fontSize:17, fontWeight:600 }}>Scansione etichetta</span>
        </div>
        <div style={{ padding:"20px", textAlign:"center" }}>
          {scanProcessing && <>
            <div style={S.spinner}/>
            <div style={{ color:text2, marginTop:12 }}>Analisi dell'etichetta in corso...</div>
          </>}
          {scanResult && !scanResult.error && (
            <div style={{ textAlign:"left" }}>
              <div style={{ background:card, borderRadius:14, padding:18, marginBottom:16 }}>
                <input value={scanResult.name} onChange={e => setScanResult({...scanResult, name: e.target.value})}
                  style={{ width:"100%", boxSizing:"border-box", background:card2, border:"1px solid #333", borderRadius:8, padding:"10px 12px", color:text1, fontSize:17, fontWeight:600, marginBottom:12, outline:"none", fontFamily:"'DM Sans', sans-serif" }}
                  placeholder="Nome prodotto"/>
                {[
                  { l:"Calorie", v: scanResult.kcal, u:"kcal" },
                  { l:"Carboidrati", v: scanResult.carb, u:"g" },
                  { l:"Grassi", v: scanResult.fat, u:"g" },
                  { l:"Proteine", v: scanResult.prot, u:"g" },
                  { l:"Fibre", v: scanResult.fib, u:"g" },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${card2}`, fontSize:14 }}>
                    <span style={{ color:text2 }}>{r.l}</span>
                    <span style={{ fontFamily:"'DM Mono', monospace" }}>{r.v} {r.u}</span>
                  </div>
                ))}
                <div style={{ fontSize:12, color:text2, marginTop:8 }}>Porzione: {scanResult.portion}</div>
              </div>
              <button onClick={saveScanResult} style={{ ...S.btn, background:accent, width:"100%" }}>
                Conferma e aggiungi
              </button>
            </div>
          )}
          {scanResult?.error && (
            <div style={{ color:red, padding:20 }}>
              Non sono riuscito a leggere l'etichetta. Riprova con una foto più nitida o aggiungi manualmente.
              {scanResult.detail && <div style={{ fontSize:11, color:text2, marginTop:8, fontFamily:"'DM Mono', monospace", wordBreak:"break-all" }}>Errore: {scanResult.detail}</div>}
              <br/><br/>
              <button onClick={() => setView("addNew")} style={{ ...S.btn, background:card2 }}>Aggiungi manualmente</button>
            </div>
          )}
        </div>
      </>}

      {/* ── STATS ── */}
      {view === "stats" && <>
        <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setView("home")} style={S.back}>◂</button>
          <span style={{ fontSize:17, fontWeight:600 }}>Riepilogo</span>
        </div>
        <div style={{ display:"flex", gap:8, padding:"4px 20px 12px" }}>
          {["week","month"].map(r => (
            <button key={r} onClick={() => setStatsRange(r)}
              style={{ ...S.btn, padding:"8px 16px", fontSize:13, background: statsRange === r ? accent : card2 }}>
              {r === "week" ? "7 giorni" : "30 giorni"}
            </button>
          ))}
        </div>

        {(() => {
          const withData = statsData.filter(d => d.hasData);
          if (withData.length === 0) return <div style={{ color:"#8A8780", textAlign:"center", padding:30 }}>Nessun dato registrato</div>;
          const avg = { kcal:0, carb:0, fat:0, prot:0 };
          const avgTarget = { kcal:0, carb:0, fat:0, prot:0 };
          withData.forEach(d => { avg.kcal += d.totals.kcal; avg.carb += d.totals.carb; avg.fat += d.totals.fat; avg.prot += d.totals.prot; avgTarget.kcal += d.target.kcal; avgTarget.carb += d.target.carb; avgTarget.fat += d.target.fat; avgTarget.prot += d.target.prot; });
          const n = withData.length;
          Object.keys(avg).forEach(k => { avg[k] = Math.round(avg[k]/n); avgTarget[k] = Math.round(avgTarget[k]/n); });
          const daysOk = withData.filter(d => d.totals.kcal <= d.target.kcal * 1.05).length;

          return (
            <div style={{ padding:"0 20px 12px" }}>
              <div style={{ background:card, borderRadius:14, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, color:"#8A8780", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>MEDIA GIORNALIERA ({n} giorni registrati)</div>
                {[
                  { l:"Calorie", v:avg.kcal, t:avgTarget.kcal, u:"kcal", c:"#F4A261" },
                  { l:"Carboidrati", v:avg.carb, t:avgTarget.carb, u:"g", c:"#F4A261" },
                  { l:"Grassi", v:avg.fat, t:avgTarget.fat, u:"g", c:"#E76F51" },
                  { l:"Proteine", v:avg.prot, t:avgTarget.prot, u:"g", c:"#2A9D8F" },
                ].map(m => (
                  <div key={m.l} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#8A8780", marginBottom:2 }}>
                      <span>{m.l}</span>
                      <span style={{ fontFamily:"'DM Mono', monospace", color: m.v > m.t ? "#E8572A" : "#F0EDE6" }}>{m.v}<span style={{color:"#8A8780"}}>/{m.t} {m.u}</span></span>
                    </div>
                    <div style={{ height:4, background:"#242424", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width: Math.min(m.v/m.t*100,100)+"%", background: m.v > m.t ? "#E8572A" : m.c, borderRadius:2 }}/>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:12, fontSize:13, color: daysOk >= n * 0.7 ? "#4CAF50" : "#E8572A", fontWeight:600 }}>
                  {daysOk}/{n} giorni nei limiti calorici
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ padding:"0 20px", overflowX:"auto" }}>
          <div style={{ fontSize:11, color:"#8A8780", fontFamily:"'DM Mono', monospace", letterSpacing:1, marginBottom:8 }}>CALORIE GIORNALIERE</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap: statsRange === "week" ? 8 : 3, minWidth: statsRange === "month" ? 600 : "auto", height:140, paddingBottom:20 }}>
            {statsData.map((d, i) => {
              const h = d.target.kcal > 0 ? Math.max((d.totals.kcal / d.target.kcal) * 100, d.hasData ? 4 : 0) : 0;
              const isOver = d.totals.kcal > d.target.kcal * 1.05;
              const isCurrent = d.date === currentDate;
              return (
                <div key={i} onClick={() => { setCurrentDate(d.date); setView("home"); }} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex: statsRange === "week" ? 1 : "none", width: statsRange === "month" ? 16 : "auto", cursor:"pointer" }}>
                  <div style={{ fontSize:9, color:"#8A8780", fontFamily:"'DM Mono', monospace", marginBottom:2 }}>
                    {d.hasData ? Math.round(d.totals.kcal) : ""}
                  </div>
                  <div style={{ width:"100%", height:100, display:"flex", alignItems:"flex-end" }}>
                    <div style={{ width:"100%", height: Math.min(h, 120)+"%", background: !d.hasData ? "#242424" : isOver ? "#E8572A" : "#4CAF50", borderRadius:3, opacity: isCurrent ? 1 : 0.7, transition:"height 0.3s ease" }}/>
                  </div>
                  <div style={{ fontSize:9, color: isCurrent ? "#F0EDE6" : "#8A8780", fontFamily:"'DM Mono', monospace", marginTop:4, fontWeight: isCurrent ? 700 : 400 }}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:16, padding:"12px 0", fontSize:11, color:"#8A8780" }}>
            <span><span style={{ display:"inline-block", width:8, height:8, background:"#4CAF50", borderRadius:2, marginRight:4 }}/>Nei limiti</span>
            <span><span style={{ display:"inline-block", width:8, height:8, background:"#E8572A", borderRadius:2, marginRight:4 }}/>Superato</span>
          </div>
        </div>
      </>}

      {/* ── SETTINGS ── */}
      {view === "settings" && <>
        <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setView("home")} style={S.back}>◂</button>
          <span style={{ fontSize:17, fontWeight:600 }}>Impostazioni</span>
        </div>
        <div style={{ padding:"12px 20px" }}>
          <label style={{ fontSize:12, color:"#8A8780", display:"block", marginBottom:6 }}>API Key Anthropic (per scansione etichette)</label>
          <input value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} type="password" placeholder="sk-ant-..."
            style={{ width:"100%", boxSizing:"border-box", background:card, border:"1px solid #333", borderRadius:10, padding:"12px 14px", color:text1, fontSize:14, outline:"none", fontFamily:"'DM Mono', monospace" }}/>
          <button onClick={async () => { setApiKey(apiKeyInput); await store.set("api_key", apiKeyInput); }}
            style={{ ...S.btn, background: accent, width:"100%", marginTop:12, opacity: apiKeyInput ? 1 : 0.4 }}>
            {apiKey ? "Aggiorna chiave" : "Salva chiave"}
          </button>
          {apiKey && <div style={{ fontSize:12, color:"#4CAF50", marginTop:8 }}>✓ Chiave configurata</div>}
          <div style={{ fontSize:11, color:"#8A8780", marginTop:12 }}>La chiave viene salvata localmente sul dispositivo e usata solo per analizzare le foto delle etichette nutrizionali.</div>
        </div>
      </>}

    </div>
  );
}

const S = {
  navBtn: { background:"none", border:"none", color:"#8A8780", fontSize:22, padding:"8px 12px", cursor:"pointer" },
  back: { background:"none", border:"none", color:"#F0EDE6", fontSize:22, padding:"4px 8px", cursor:"pointer" },
  btn: { border:"none", borderRadius:14, padding:"14px 18px", fontSize:15, fontWeight:600, color:"#F0EDE6", cursor:"pointer", fontFamily:"'DM Sans', sans-serif" },
  loadWrap: { display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0D0D0D" },
  spinner: { width:32, height:32, border:"3px solid #333", borderTop:"3px solid #E8572A", borderRadius:"50%", animation:"spin 0.8s linear infinite" },
};

// Global keyframes
if (typeof document !== "undefined" && !document.getElementById("diet-spin")) {
  const style = document.createElement("style");
  style.id = "diet-spin";
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}
