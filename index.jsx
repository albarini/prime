import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════
// CONFIG — Real data, April 3 deadline
// ════════════════════════════════════════════════════════════

const ZONES = [
  { id:"core", label:"Autocuidado", color:"#FF3B30", tint:"#FFF0F0",
    habits:[{name:"Abstinencia",wg:7},{name:"Voz",wg:5},{name:"B12",wg:7},{name:"Colágeno",wg:7},{name:"Maca",wg:7}] },
  { id:"nut", label:"Nutrición", color:"#34C759", tint:"#F0FAF3",
    habits:[{name:"Beterraga",wg:4},{name:"Romero",wg:4},{name:"Vit. C",wg:7},{name:"Mg 1.5g",wg:7},{name:"Manzanilla",wg:5},{name:"Quinoa",wg:5},{name:"Zinc 30mg",wg:7},{name:"Palta",wg:4},{name:"Kefir",wg:5},{name:"Zanahoria",wg:4},{name:"Proteína",wg:7}] },
  { id:"life", label:"Estilo de vida", color:"#007AFF", tint:"#F0F5FF",
    habits:[{name:"Kéfir ✓",wg:5},{name:"Cañihua ✓",wg:4},{name:"Nueces ✓",wg:5},{name:"Ejercicio ✓",wg:3}] },
];
const ALL_H = ZONES.flatMap(z=>z.habits);

const DEADLINE = new Date(2026, 3, 3); // April 3
const TODAY = new Date(2026, 2, 15);

const BOOKS = [
  { id:"b0", name:"48 Leyes del Poder", short:"48 Leyes", totalPages:524, startPage:0,
    dailyGoal:25, color:"#FF3B30", tint:"#FFF0F0", icon:"I" },
  { id:"b1", name:"Arte de la Seducción", short:"Arte Sed.", totalPages:542, startPage:0,
    dailyGoal:28, color:"#AF52DE", tint:"#F5F0FF", icon:"II" },
  { id:"b2", name:"Conecta con el Dinero", short:"Tracy", totalPages:280, startPage:0,
    dailyGoal:14, color:"#007AFF", tint:"#F0F5FF", icon:"III" },
];
const DAILY_GOAL = BOOKS.reduce((s,b)=>s+b.dailyGoal,0); // 67

const OBJS = [
  {n:"Pagar el préstamo",p:"alta",c:"Finanzas"},{n:"Masa muscular",p:"alta",c:"Salud"},
  {n:"Obtener brevette",p:"alta",c:"Personal"},{n:"Trabajar ventas c/ Edgar",p:"alta",c:"Finanzas"},
  {n:"Ventas al estado",p:"alta",c:"Negocio"},{n:"Brackets / Diente",p:"alta",c:"Salud"},
  {n:"Avanzar carrera Civil",p:"alta",c:"Carrera"},{n:"Creatina",p:"media",c:"Salud"},
  {n:"Minoxidil",p:"media",c:"Salud"},{n:"Barba y cejas",p:"media",c:"Estilo"},
  {n:"Manchas cara & postura",p:"media",c:"Personal"},{n:"Inglés y chino",p:"media",c:"Educación"},
  {n:"Bolsa Lima / EEUU",p:"media",c:"Finanzas"},{n:"WhatsApp comercial",p:"media",c:"Negocio"},
  {n:"Página de ventas",p:"media",c:"Negocio"},{n:"Autocad / BIM",p:"media",c:"Carrera"},
  {n:"Claude Pro + NOTION",p:"media",c:"Herramientas"},{n:"Automatizar contenido",p:"media",c:"Negocio"},
  {n:"Rino-8000",p:"media",c:"Salud"},{n:"iPhone 16 Pro Max",p:"vision",c:"Tech"},
  {n:"Tablet Samsung",p:"vision",c:"Tech"},{n:"DJI Action 5 Pro",p:"vision",c:"Tech"},
  {n:"Insta360 Ace Pro 2",p:"vision",c:"Tech"},{n:"Audífonos Marshall",p:"vision",c:"Tech"},
  {n:"Refrigerador",p:"vision",c:"Hogar"},{n:"Purificador de aire",p:"vision",c:"Hogar"},
  {n:"Maleta de cuero",p:"vision",c:"Estilo"},{n:"Casaca Maverick",p:"vision",c:"Estilo"},
  {n:"Ir a Apurímac",p:"vision",c:"Personal"},
];
const PC={alta:{l:"Alta",co:"#FF3B30",bg:"#FFF0F0"},media:{l:"Media",co:"#FF9500",bg:"#FFF8F0"},vision:{l:"Visión",co:"#AF52DE",bg:"#F5F0FF"}};

const fmt=d=>d.toISOString().slice(0,10);
const DE=["dom","lun","mar","mié","jue","vie","sáb"];
const daysB=(a,b)=>Math.round((b-a)/864e5);

function weekOf(ref){
  const d=new Date(ref),mon=new Date(d);
  mon.setDate(d.getDate()-((d.getDay()+6)%7));
  return Array.from({length:7},(_,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);return x;});
}

function allDatesFrom(start, end) {
  const dates = [];
  const d = new Date(start);
  while (d <= end) { dates.push(new Date(d)); d.setDate(d.getDate()+1); }
  return dates;
}

const ALL_DATES = allDatesFrom(new Date(2026,2,9), DEADLINE);

const SEED=(()=>{
  const d={};
  [{d:"2026-03-09",h:{Abstinencia:1,Manzanilla:1},pg:{b0:29,b1:3,b2:7}},
   {d:"2026-03-10",h:{Abstinencia:1,Maca:1,Manzanilla:1},pg:{b0:39,b1:9,b2:17}},
   {d:"2026-03-11",h:{Abstinencia:1,Maca:1,"Mg 1.5g":1,Manzanilla:1},pg:{b0:45,b1:11,b2:17}},
   {d:"2026-03-12",h:{Abstinencia:1,Maca:1,"Mg 1.5g":1,Manzanilla:1},pg:{b0:54,b1:14,b2:21}},
   {d:"2026-03-13",h:{Abstinencia:1,Maca:1,"Mg 1.5g":1},pg:{b0:null,b1:null,b2:null}},
   {d:"2026-03-14",h:{Abstinencia:1},pg:{b0:null,b1:null,b2:null}},
   {d:"2026-03-15",h:{Abstinencia:1,Maca:1,Manzanilla:1,Kefir:1},pg:{b0:null,b1:null,b2:null}},
  ].forEach(({d:dt,h,pg})=>{
    const habits={};ALL_H.forEach(x=>habits[x.name]=h[x.name]||0);
    d[dt]={habits,pageNum:{...pg}};
  });
  return d;
})();

const STORAGE_KEY = "sistema-personal-v14";

async function loadFromStorage() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) return JSON.parse(result.value);
  } catch (e) {}
  return null;
}

async function saveToStorage(data, objDone) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify({ data, objDone, savedAt: new Date().toISOString() }));
  } catch (e) {}
}

// ════════════════════════════════════════════════════════════
// READING LOGIC
// ════════════════════════════════════════════════════════════

function getLastPage(bookId, beforeDate, allDates, data) {
  let last = 0;
  for (const d of allDates) {
    if (fmt(d) >= beforeDate) break;
    const p = data[fmt(d)]?.pageNum?.[bookId];
    if (p != null && p > 0) last = p;
  }
  return last;
}

function getCurrentPage(bookId, allDates, data) {
  let last = 0;
  for (const d of allDates) {
    const p = data[fmt(d)]?.pageNum?.[bookId];
    if (p != null && p > 0) last = p;
  }
  return last;
}

function getReadForDate(bookId, date, allDates, data) {
  const ds = fmt(date);
  const pg = data[ds]?.pageNum?.[bookId];
  if (pg == null || pg <= 0) return { pageNum: null, read: 0 };
  const prev = getLastPage(bookId, ds, allDates, data);
  return { pageNum: pg, read: Math.max(0, pg - prev) };
}

// ════════════════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════════════════

function Ring({pct,color,size=36,stroke=3,children}){
  const r=(size-stroke)/2,c=2*Math.PI*r;
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c*(1-Math.min(1,Math.max(0,pct)))} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)"}}/>
    </svg>
    {children&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>}
  </div>);
}
function Chk(){return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function MiniBar({pct,color,h=4}){return(<div style={{height:h,background:"#F0F0F0",borderRadius:h/2,overflow:"hidden",flex:1}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,pct*100))}%`,background:color,borderRadius:h/2,transition:"width 0.4s ease"}}/></div>);}
function Blocks({pct,color,n=5}){const f=Math.round(Math.min(1,pct)*n);return(<div style={{display:"flex",gap:2}}>{Array.from({length:n},(_,i)=><div key={i} style={{width:5,height:10,borderRadius:1.5,background:i<f?color:"#EDEDF0",transition:"background 0.3s"}}/>)}</div>);}
function Pill({label,value,color}){return(<div style={{background:"#fff",borderRadius:8,padding:"3px 10px",border:"0.5px solid #E5E5EA",display:"inline-flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:"#AEAEB2"}}>{label}</span><span style={{fontSize:11,fontWeight:600,color}}>{value}</span></div>);}

// ════════════════════════════════════════════════════════════
// TOTAL PROGRESS BAR — the hero component
// ════════════════════════════════════════════════════════════

function TotalProgressBar({ data }) {
  const daysLeft = Math.max(0, daysB(TODAY, DEADLINE));
  const totalPages = BOOKS.reduce((s,b) => s + b.totalPages, 0); // 1346
  const totalRead = BOOKS.reduce((s,b) => s + getCurrentPage(b.id, ALL_DATES, data), 0);
  const totalPct = totalRead / totalPages;
  const remaining = totalPages - totalRead;
  const daysWithRead = ALL_DATES.filter(d => {
    return BOOKS.some(b => { const p = data[fmt(d)]?.pageNum?.[b.id]; return p != null && p > 0; });
  }).length;
  const rhythm = daysWithRead > 0 ? totalRead / daysWithRead : 0;
  const onTrack = daysLeft > 0 ? remaining / daysLeft <= DAILY_GOAL * 1.1 : totalRead >= totalPages;

  return (
    <div style={{background:"#fff",borderRadius:20,border:"0.5px solid #E5E5EA",padding:"20px 20px 16px",marginBottom:16}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{fontSize:11,color:"#8E8E93",fontWeight:500}}>PROGRESO TOTAL DE LECTURA</div>
          <div style={{fontSize:28,fontWeight:300,color:"#1C1C1E",letterSpacing:-1,marginTop:2}}>
            {totalRead}<span style={{fontSize:14,color:"#AEAEB2",fontWeight:400}}> / {totalPages} págs</span>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:28,fontWeight:300,color:daysLeft<=5?"#FF3B30":daysLeft<=10?"#FF9500":"#007AFF",letterSpacing:-1}}>
            {daysLeft}
          </div>
          <div style={{fontSize:11,color:"#8E8E93"}}>días para 3 abr</div>
        </div>
      </div>

      {/* Main progress bar */}
      <div style={{position:"relative",height:28,background:"#F2F2F7",borderRadius:14,overflow:"hidden",marginBottom:8}}>
        {/* Segment bars per book */}
        {(() => {
          let offset = 0;
          return BOOKS.map((b,i) => {
            const cp = getCurrentPage(b.id, ALL_DATES, data);
            const w = (cp / totalPages) * 100;
            const el = <div key={i} style={{position:"absolute",left:`${offset}%`,top:0,bottom:0,width:`${w}%`,background:b.color,transition:"width 0.5s ease",borderRight:i<2?"2px solid #fff":"none"}}/>;
            offset += w;
            return el;
          });
        })()}
        {/* Target line */}
        <div style={{position:"absolute",left:`${totalPct*100}%`,top:-2,bottom:-2,width:2,background:"#1C1C1E",borderRadius:1,zIndex:2}}/>
        {/* Percentage label */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>
          <span style={{fontSize:13,fontWeight:700,color:totalPct>0.3?"#fff":"#1C1C1E",textShadow:totalPct>0.3?"0 1px 2px rgba(0,0,0,0.3)":"none"}}>{Math.round(totalPct*100)}%</span>
        </div>
      </div>

      {/* Book segments legend */}
      <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>
        {BOOKS.map((b,i) => {
          const cp = getCurrentPage(b.id, ALL_DATES, data);
          const bPct = cp / b.totalPages;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:b.tint,borderRadius:8,flex:"1 1 140px"}}>
              <div style={{width:8,height:8,borderRadius:4,background:b.color,flexShrink:0}}/>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:b.color,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.short}</div>
                <div style={{fontSize:10,color:"#AEAEB2"}}>pág {cp}/{b.totalPages} · {Math.round(bPct*100)}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <Pill label="Ritmo actual" value={`${rhythm.toFixed(1)} p/d`} color={rhythm>=DAILY_GOAL?"#34C759":"#FF9500"}/>
        <Pill label="Necesitas" value={daysLeft>0?`${Math.ceil(remaining/daysLeft)} p/d`:"—"} color={onTrack?"#34C759":"#FF3B30"}/>
        <Pill label="Faltan" value={`${remaining} págs`} color="#007AFF"/>
        <Pill label="Trayectoria" value={onTrack?"En meta":"Atrás"} color={onTrack?"#34C759":"#FF3B30"}/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// BOOK CARD
// ════════════════════════════════════════════════════════════

function BookCard({book, weekDates, data, setPageNum}) {
  const cp = getCurrentPage(book.id, ALL_DATES, data);
  const pct = cp / book.totalPages;
  const remaining = book.totalPages - cp;
  const daysLeft = Math.max(0, daysB(TODAY, DEADLINE));
  const needPerDay = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : 0;
  const daysWithRead = ALL_DATES.filter(d => getReadForDate(book.id, d, ALL_DATES, data).read > 0).length;
  const rhythm = daysWithRead > 0 ? cp / daysWithRead : 0;
  const weekRead = weekDates.reduce((s,d) => s + getReadForDate(book.id, d, ALL_DATES, data).read, 0);
  const weekGoal = book.dailyGoal * 7;
  const goalDaysMet = weekDates.reduce((s,d) => s + (getReadForDate(book.id, d, ALL_DATES, data).read >= book.dailyGoal ? 1 : 0), 0);
  const onTrack = needPerDay <= book.dailyGoal * 1.2;

  return (
    <div style={{background:"#fff",borderRadius:18,border:"0.5px solid #E5E5EA",overflow:"hidden",marginBottom:14}}>
      <div style={{padding:"14px 16px 12px",background:`linear-gradient(135deg,${book.tint} 0%,#fff 100%)`,borderBottom:"0.5px solid #F2F2F7"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <Ring pct={pct} color={book.color} size={56} stroke={4}>
            <span style={{fontSize:13,fontWeight:700,color:book.color}}>{Math.round(pct*100)}%</span>
          </Ring>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,letterSpacing:-0.3}}>{book.name}</div>
            <div style={{fontSize:12,marginTop:2}}>
              <span style={{color:book.color,fontWeight:600}}>Pág. {cp}</span>
              <span style={{color:"#AEAEB2"}}> de {book.totalPages}</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:20,fontWeight:300,color:onTrack?"#34C759":"#FF3B30",letterSpacing:-0.5}}>{book.dailyGoal}</div>
            <div style={{fontSize:9,color:"#8E8E93"}}>págs/día</div>
          </div>
        </div>

        {/* Progress bar with deadline marker */}
        <div style={{marginTop:12,position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#AEAEB2",marginBottom:3}}>
            <span>Progreso</span>
            <span>{remaining} págs restantes · {needPerDay} p/d necesitas</span>
          </div>
          <div style={{height:8,background:"#F0F0F0",borderRadius:4,overflow:"hidden",position:"relative"}}>
            <div style={{height:"100%",width:`${pct*100}%`,background:book.color,borderRadius:4,transition:"width 0.5s ease"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>
          <Pill label="Ritmo" value={`${rhythm.toFixed(1)} p/d`} color={rhythm>=book.dailyGoal?"#34C759":"#FF9500"}/>
          <Pill label="Necesitas" value={`${needPerDay} p/d`} color={onTrack?"#34C759":"#FF3B30"}/>
          <Pill label="Semana" value={`${weekRead}/${weekGoal}`} color={weekRead>=weekGoal?"#34C759":book.color}/>
          <Pill label="Días meta" value={`${goalDaysMet}/7`} color={goalDaysMet>=4?"#34C759":"#FF9500"}/>
        </div>
      </div>

      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#FAFAFA",borderBottom:"0.5px solid #F2F2F7"}}>
        {weekDates.map((d,i)=>{const isT=fmt(d)===fmt(TODAY);return(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"5px 0",borderRight:i<6?"0.5px solid #F2F2F7":"none"}}>
            <span style={{fontSize:8,fontWeight:isT?700:400,color:isT?book.color:"#C7C7CC",textTransform:"uppercase"}}>{DE[d.getDay()]}</span>
            <span style={{fontSize:11,fontWeight:isT?700:500,color:isT?book.color:"#8E8E93"}}>{d.getDate()}</span>
          </div>
        );})}
      </div>

      {/* Page input */}
      <div style={{padding:"4px 0 0"}}>
        <div style={{padding:"0 12px 2px"}}><span style={{fontSize:9,color:"#AEAEB2",fontWeight:500}}>Pág. donde me quedé</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {weekDates.map((d,i)=>{
            const ds=fmt(d),pg=data[ds]?.pageNum?.[book.id],isT=ds===fmt(TODAY);
            return(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 3px",borderRight:i<6?"0.5px solid #F5F5F5":"none",background:isT?book.tint:"transparent"}}>
                <input type="number" min="0" max={book.totalPages} value={pg!=null?pg:""} placeholder="—"
                  onChange={e=>setPageNum(ds,book.id,e.target.value)}
                  style={{width:48,border:"1px solid "+(pg!=null?"#E5E5EA":"transparent"),borderRadius:8,padding:"6px 2px",textAlign:"center",fontSize:15,fontWeight:600,color:pg!=null?book.color:"#D1D1D6",background:pg!=null?"#FAFAFA":"transparent",outline:"none"}}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-calculated pages read */}
      <div style={{borderTop:"0.5px solid #F2F2F7",padding:"4px 0"}}>
        <div style={{padding:"0 12px 2px"}}><span style={{fontSize:9,color:"#34C759",fontWeight:600}}>Leídas hoy (auto)</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {weekDates.map((d,i)=>{
            const r=getReadForDate(book.id,d,ALL_DATES,data);const met=r.read>=book.dailyGoal;
            return(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 3px",gap:3,borderRight:i<6?"0.5px solid #F5F5F5":"none"}}>
                <span style={{fontSize:16,fontWeight:700,color:met?"#34C759":r.read>0?book.color:"#D1D1D6",letterSpacing:-0.5}}>{r.read>0?r.read:"·"}</span>
                <Blocks pct={r.read/book.dailyGoal} color={met?"#34C759":book.color}/>
                <span style={{fontSize:8,color:met?"#34C759":r.read>0?"#8E8E93":"#D1D1D6",fontWeight:met?600:400}}>
                  {met?"✓ meta":r.read>0?`${Math.round(r.read/book.dailyGoal*100)}%`:"—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// HABIT COMPONENTS
// ════════════════════════════════════════════════════════════

function HRow({h,z,wd,data,toggle}){
  const n=wd.reduce((s,d)=>s+(data[fmt(d)]?.habits?.[h.name]===1?1:0),0),p=n/h.wg,met=n>=h.wg;
  return(<div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,1fr) 48px",alignItems:"center",padding:"0 4px",minHeight:46,borderBottom:"0.5px solid #F5F5F5"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",minWidth:0}}>
      <Ring pct={p} color={met?"#34C759":p>0?z.color:"#E5E5EA"} size={26} stroke={2.5}><span style={{fontSize:7,fontWeight:700,color:met?"#34C759":p>0?"#1C1C1E":"#C7C7CC"}}>{n}</span></Ring>
      <div style={{minWidth:0,flex:1}}><div style={{fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.name}</div><div style={{fontSize:9,color:met?"#34C759":"#AEAEB2"}}>{met?"✓ Meta":`${n}/${h.wg}`}</div></div>
    </div>
    {wd.map((d,i)=>{const ds=fmt(d),v=data[ds]?.habits?.[h.name],done=v===1,nd=v===0,isT=ds===fmt(TODAY),isF=d>TODAY;
      return(<div key={i} onClick={()=>toggle(ds,h.name)} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"3px 0",cursor:"pointer",userSelect:"none"}}>
        <div style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
          background:done?z.color:isT&&!nd?z.tint:nd?"#FEF5F5":isF?"#FAFAFA":"#F5F5F5",
          border:isT&&!done?`2px solid ${z.color}`:"none",boxShadow:done?`0 1px 5px ${z.color}30`:"none",
          transition:"all 0.2s",transform:done?"scale(1)":"scale(0.88)"}}>
          {done?<Chk/>:nd?<div style={{width:6,height:1.5,borderRadius:1,background:"#E0BFBF"}}/>:isF?<div style={{width:4,height:4,borderRadius:2,background:"#E5E5EA"}}/>:<div style={{width:6,height:6,borderRadius:3,border:"1.5px solid #D1D1D6"}}/>}
        </div></div>);
    })}
    <div style={{padding:"0 6px"}}><MiniBar pct={p} color={met?"#34C759":z.color}/></div>
  </div>);
}

function ZoneCard({z,wd,data,toggle}){
  const tG=z.habits.reduce((s,h)=>s+h.wg,0),tD=z.habits.reduce((s,h)=>s+wd.reduce((ss,d)=>ss+(data[fmt(d)]?.habits?.[h.name]===1?1:0),0),0),zP=tD/tG,hM=z.habits.filter(h=>wd.reduce((s,d)=>s+(data[fmt(d)]?.habits?.[h.name]===1?1:0),0)>=h.wg).length;
  return(<div style={{background:"#fff",borderRadius:18,marginBottom:14,border:"0.5px solid #E5E5EA",overflow:"hidden"}}>
    <div style={{padding:"12px 14px 8px",background:`linear-gradient(135deg,${z.tint} 0%,#fff 100%)`,borderBottom:"0.5px solid #F2F2F7",display:"flex",alignItems:"center",gap:10}}>
      <Ring pct={zP} color={z.color} size={38} stroke={3}><span style={{fontSize:10,fontWeight:700,color:z.color}}>{Math.round(zP*100)}</span></Ring>
      <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:5,height:16,borderRadius:2,background:z.color}}/><span style={{fontSize:14,fontWeight:700}}>{z.label}</span><span style={{fontSize:10,color:"#AEAEB2"}}>{z.habits.length}</span></div><div style={{fontSize:10,color:"#8E8E93",marginTop:1}}>{hM}/{z.habits.length} metas · {tD}/{tG}</div></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,1fr) 48px",padding:"0 4px",background:"#FAFAFA",borderBottom:"0.5px solid #F2F2F7"}}>
      <div style={{padding:"5px 8px"}}><span style={{fontSize:9,fontWeight:600,color:z.color,textTransform:"uppercase",letterSpacing:0.8}}>Meta</span></div>
      {wd.map((d,i)=>{const isT=fmt(d)===fmt(TODAY);return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"3px 0"}}><span style={{fontSize:8,fontWeight:isT?700:400,color:isT?z.color:"#C7C7CC",textTransform:"uppercase"}}>{DE[d.getDay()]}</span><span style={{fontSize:11,fontWeight:isT?700:500,color:isT?z.color:"#8E8E93"}}>{d.getDate()}</span></div>);})}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,fontWeight:600,color:"#C7C7CC"}}>SEM</span></div>
    </div>
    {z.habits.map(h=><HRow key={h.name} h={h} z={z} wd={wd} data={data} toggle={toggle}/>)}
    <div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,1fr) 48px",padding:"0 4px",background:"#FAFAFA",borderTop:"0.5px solid #E5E5EA"}}>
      <div style={{padding:"5px 8px"}}><span style={{fontSize:9,fontWeight:700,color:z.color}}>Día</span></div>
      {wd.map((d,i)=>{const ds=fmt(d),dt=data[ds]?z.habits.reduce((s,h)=>s+(data[ds]?.habits?.[h.name]===1?1:0),0):0,dp=dt/z.habits.length;return(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"5px 0"}}><span style={{fontSize:12,fontWeight:700,color:dp>=0.7?"#34C759":dp>=0.3?"#FF9500":dt>0?"#FF3B30":"#D1D1D6"}}>{dt||"·"}</span></div>);})}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,fontWeight:800,color:z.color}}>{tD}</span></div>
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════

export default function App(){
  const [data,setData]=useState(SEED);
  const [tab,setTab]=useState("reading");
  const [objDone,setObjDone]=useState({});
  const [wOff,setWOff]=useState(0);
  const [loaded,setLoaded]=useState(false);
  const saveTimer=useRef(null);

  // Load from storage on mount
  useEffect(()=>{
    loadFromStorage().then(saved=>{
      if(saved){
        if(saved.data) setData(prev=>{
          // Merge: saved data overrides SEED, but keep SEED structure for any missing days
          const merged={...prev};
          Object.keys(saved.data).forEach(k=>{merged[k]=saved.data[k];});
          return merged;
        });
        if(saved.objDone) setObjDone(saved.objDone);
      }
      setLoaded(true);
    }).catch(()=>setLoaded(true));
  },[]);

  // Auto-save on every data change (debounced 500ms)
  useEffect(()=>{
    if(!loaded) return;
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>saveToStorage(data,objDone),500);
    return ()=>{if(saveTimer.current) clearTimeout(saveTimer.current);};
  },[data,objDone,loaded]);

  const ref=new Date(TODAY);ref.setDate(ref.getDate()+wOff*7);
  const wd=weekOf(ref);
  const wLbl=`${wd[0].getDate()} ${wd[0].toLocaleDateString("es",{month:"short"})} — ${wd[6].getDate()} ${wd[6].toLocaleDateString("es",{month:"short"})}`;

  const toggle=useCallback((ds,name)=>{setData(p=>{const day=p[ds]||{habits:{},pageNum:{b0:null,b1:null,b2:null}};ALL_H.forEach(h=>{if(day.habits[h.name]===undefined)day.habits[h.name]=0;});return{...p,[ds]:{...day,habits:{...day.habits,[name]:day.habits[name]===1?0:1}}};});},[]);
  const setPageNum=useCallback((ds,bookId,val)=>{setData(p=>{const day=p[ds]||{habits:{},pageNum:{b0:null,b1:null,b2:null}};ALL_H.forEach(h=>{if(day.habits[h.name]===undefined)day.habits[h.name]=0;});return{...p,[ds]:{...day,pageNum:{...day.pageNum,[bookId]:val===""?null:parseInt(val)}}};});},[]);

  const stats=useMemo(()=>{
    let tH=0;const hT={};ALL_H.forEach(h=>hT[h.name]=0);
    wd.forEach(d=>{const day=data[fmt(d)];if(!day)return;ALL_H.forEach(h=>{if(day.habits?.[h.name]===1){tH++;hT[h.name]++;}});});
    const tG=ALL_H.reduce((s,h)=>s+h.wg,0),mC=ALL_H.filter(h=>hT[h.name]>=h.wg).length;
    const tD=data[fmt(TODAY)],tT=tD?ALL_H.reduce((s,h)=>s+(tD.habits?.[h.name]===1?1:0),0):0;
    let weekPages=0;wd.forEach(d=>{BOOKS.forEach(b=>{weekPages+=getReadForDate(b.id,d,ALL_DATES,data).read;});});
    return{tH,tG,mC,hT,tT,weekPages};
  },[data,wd]);

  const daysLeft = Math.max(0, daysB(TODAY, DEADLINE));
  const navItems=[{id:"habits",l:"Hábitos"},{id:"reading",l:"Lecturas"},{id:"objectives",l:"Objetivos"}];

  return(
    <div style={{fontFamily:'-apple-system,"SF Pro Display","Helvetica Neue",sans-serif',background:"#F2F2F7",minHeight:"100vh",color:"#1C1C1E"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}*{box-sizing:border-box}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}::-webkit-scrollbar{height:3px}::-webkit-scrollbar-thumb{background:#D1D1D6;border-radius:2px}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>

      {!loaded?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:12}}>
          <div style={{width:32,height:32,borderRadius:16,border:"3px solid #F2F2F7",borderTopColor:"#007AFF",animation:"pulse 1s ease infinite"}}/>
          <span style={{fontSize:13,color:"#8E8E93"}}>Cargando datos guardados...</span>
        </div>
      ):(
      <>

      <nav style={{background:"rgba(255,255,255,0.72)",backdropFilter:"blur(20px) saturate(180%)",WebkitBackdropFilter:"blur(20px) saturate(180%)",borderBottom:"0.5px solid rgba(0,0,0,0.1)",position:"sticky",top:0,zIndex:100,padding:"0 16px",display:"flex",alignItems:"center",height:50}}>
        <div style={{fontWeight:700,fontSize:17,letterSpacing:-0.4}}>Sistema Personal</div>
        <span style={{fontSize:11,color:"#AEAEB2",marginLeft:6}}>2026</span>
        {loaded&&<span style={{fontSize:9,color:"#34C759",marginLeft:6,opacity:0.7}}>guardado</span>}
        <div style={{marginLeft:"auto",display:"flex",gap:2,background:"#EDEDF0",borderRadius:9,padding:2}}>
          {navItems.map(n=>(<button key={n.id} onClick={()=>setTab(n.id)} style={{border:"none",cursor:"pointer",padding:"5px 14px",borderRadius:7,fontSize:13,fontWeight:500,background:tab===n.id?"#fff":"transparent",color:tab===n.id?"#1C1C1E":"#8E8E93",boxShadow:tab===n.id?"0 0.5px 2px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"}}>{n.l}</button>))}
        </div>
      </nav>

      <main style={{maxWidth:1000,margin:"0 auto",padding:"12px 12px 48px",animation:"fadeUp 0.3s ease"}} key={tab+wOff}>
        {/* KPIs */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 100px",background:"#F0F5FF",borderRadius:14,padding:"10px 14px"}}><div style={{fontSize:8,color:"#8E8E93",fontWeight:600}}>SEMANA</div><div style={{fontSize:20,fontWeight:300,color:"#007AFF",lineHeight:1.1,marginTop:2}}>{stats.tH}<span style={{fontSize:11,color:"#AEAEB2"}}>/{stats.tG}</span></div></div>
          <div style={{flex:"1 1 100px",background:"#F0FAF3",borderRadius:14,padding:"10px 14px"}}><div style={{fontSize:8,color:"#8E8E93",fontWeight:600}}>METAS</div><div style={{fontSize:20,fontWeight:300,color:"#34C759",lineHeight:1.1,marginTop:2}}>{stats.mC}<span style={{fontSize:11,color:"#AEAEB2"}}>/{ALL_H.length}</span></div></div>
          <div style={{flex:"1 1 100px",background:stats.weekPages>0?"#F0FAF3":"#FFF8F0",borderRadius:14,padding:"10px 14px"}}><div style={{fontSize:8,color:"#8E8E93",fontWeight:600}}>LECTURA SEM</div><div style={{fontSize:20,fontWeight:300,color:stats.weekPages>0?"#34C759":"#FF9500",lineHeight:1.1,marginTop:2}}>{stats.weekPages}<span style={{fontSize:11,color:"#AEAEB2"}}> p</span></div></div>
          <div style={{flex:"1 1 100px",background:"#FFF0F0",borderRadius:14,padding:"10px 14px"}}><div style={{fontSize:8,color:"#8E8E93",fontWeight:600}}>DEADLINE</div><div style={{fontSize:20,fontWeight:300,color:daysLeft<=7?"#FF3B30":"#007AFF",lineHeight:1.1,marginTop:2}}>{daysLeft}<span style={{fontSize:11,color:"#AEAEB2"}}> días</span></div></div>
        </div>

        {/* Week nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:14}}>
          <button onClick={()=>setWOff(o=>o-1)} style={nb}><svg width="7" height="12" viewBox="0 0 7 12"><path d="M6 1L1 6L6 11" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" fill="none"/></svg></button>
          <div style={{textAlign:"center",minWidth:180}}><div style={{fontSize:15,fontWeight:700,letterSpacing:-0.3}}>{wLbl}</div><div style={{fontSize:10,color:"#8E8E93"}}>{wOff===0?"Esta semana":wOff===-1?"Anterior":"Semana "+Math.abs(wOff)}</div></div>
          <button onClick={()=>setWOff(o=>o+1)} style={nb}><svg width="7" height="12" viewBox="0 0 7 12"><path d="M1 1L6 6L1 11" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" fill="none"/></svg></button>
          {wOff!==0&&<button onClick={()=>setWOff(0)} style={{...nb,width:"auto",padding:"6px 12px",fontSize:11,color:"#007AFF"}}>Hoy</button>}
        </div>

        {tab==="reading"&&<>
          <TotalProgressBar data={data}/>
          {BOOKS.map(b=><BookCard key={b.id} book={b} weekDates={wd} data={data} setPageNum={setPageNum}/>)}
        </>}

        {tab==="habits"&&<>{ZONES.map(z=><ZoneCard key={z.id} z={z} wd={wd} data={data} toggle={toggle}/>)}</>}

        {tab==="objectives"&&<ObjTab od={objDone} setOd={setObjDone}/>}

        <div style={{marginTop:32,textAlign:"center"}}>
          <button onClick={()=>{if(confirm("¿Borrar todos los datos y volver al inicio? Esta acción no se puede deshacer.")){setData(SEED);setObjDone({});saveToStorage(SEED,{});}}}
            style={{border:"none",background:"transparent",color:"#FF3B30",fontSize:12,cursor:"pointer",padding:"8px 16px",borderRadius:8,opacity:0.6}}>
            Reiniciar datos
          </button>
        </div>
      </main>
      </>)}
    </div>
  );
}

function ObjTab({od,setOd}){const [f,setF]=useState("all");const fl=f==="all"?OBJS:OBJS.filter(o=>o.p===f);const cts={alta:0,media:0,vision:0};OBJS.forEach(o=>cts[o.p]++);
  return(<><div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{[{id:"all",l:`Todos (${OBJS.length})`,co:"#1C1C1E",bg:"#F2F2F7"},{id:"alta",l:`Alta (${cts.alta})`,co:PC.alta.co,bg:PC.alta.bg},{id:"media",l:`Media (${cts.media})`,co:PC.media.co,bg:PC.media.bg},{id:"vision",l:`Visión (${cts.vision})`,co:PC.vision.co,bg:PC.vision.bg}].map(x=><button key={x.id} onClick={()=>setF(x.id)} style={{border:"none",cursor:"pointer",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,background:f===x.id?x.co:x.bg,color:f===x.id?"#fff":x.co,transition:"all 0.2s"}}>{x.l}</button>)}</div>
  <div style={{display:"grid",gap:6}}>{fl.map((o,i)=>{const dn=od[o.n],pc=PC[o.p];return(<div key={i} onClick={()=>setOd(p=>({...p,[o.n]:!p[o.n]}))} style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"0.5px solid #E5E5EA",display:"flex",alignItems:"center",gap:12,cursor:"pointer",opacity:dn?0.4:1,transition:"all 0.2s"}}><div style={{width:22,height:22,borderRadius:11,border:dn?"none":`2px solid ${pc.co}`,background:dn?"#34C759":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{dn&&<Chk/>}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,textDecoration:dn?"line-through":"none",color:dn?"#8E8E93":"#1C1C1E"}}>{o.n}</div><div style={{fontSize:10,color:"#AEAEB2",marginTop:1}}>{o.c}</div></div><span style={{fontSize:10,fontWeight:600,color:pc.co,background:pc.bg,padding:"2px 8px",borderRadius:12}}>{pc.l}</span></div>);})}</div></>);
}

const nb={width:36,height:36,borderRadius:18,border:"none",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"};
