// ==UserScript==
// @name         Pannello Certificati
// @namespace    valappet
// @version      4.7
// @description  Schede indipendenti con badge laterali uniformi (ATA/SDLP/RME/APU/L4+). L4+ auto-from-title, badge allineati a destra come colonna laterale estetica. Clic = inserisci nel campo attivo • Doppio clic = copia.
// @author       Tu
// @match        https://dub.umbrella.amazon.dev/*
// @downloadURL  https://github.com/valentinaappetecchia-a11y/Pannello-/raw/refs/heads/main/Pannello%20Certificati.user.js
// @updateURL    https://github.com/valentinaappetecchia-a11y/Pannello-/raw/refs/heads/main/Pannello%20Certificati.user.js
// @run-at       document-idle
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  // Esegui SOLO nella finestra principale (evita bottoni dentro iframe)
  if (window.top !== window.self) return;

  const UI_VERSION = '4.7';
  console.log('[CertPanel] UI', UI_VERSION);

  // cleanup precedente
  document.getElementById('certPanel')?.remove();
  document.getElementById('certPanelToggle')?.remove();
  document.getElementById('certPanelStyles')?.remove();

  /* =======================
        ETICHETTE (pastello)
     ======================= */
  const TAGS = {
    ATA:  { label: 'ATA',  bg: '#dbeafe', fg: '#1e3a8a', brd: '#bfdbfe' },
    SDLP: { label: 'SDLP', bg: '#fee2e2', fg: '#991b1b', brd: '#fecaca' },
    RME:  { label: 'RME',  bg: '#d1fae5', fg: '#065f46', brd: '#a7f3d0' },
    APU:  { label: 'APU',  bg: '#f3e8ff', fg: '#6b21a8', brd: '#e9d5ff' },
    'L4+':{ label: 'L4+', bg: '#e5e7eb', fg: '#111827', brd: '#d1d5db' }
  };

  /* =======================
        CATALOGO
     ======================= */
  const DEFAULT_BOOKS = {
    prima: [
      {
        label: '📌 Dock Safety',
        value: [
          { label: 'EUCF_ SDLP_ALL_Dock Safety Test', value: 'EUCF_ SDLP_ALL_Dock Safety Test', tag: 'SDLP' },
          { label: 'EUCF_ ILT/SDLP_ALL_Dock Safety Training', value: 'EUCF_ ILT/SDLP_ALL_Dock Safety Training', tag: 'ATA' }
        ]
      },
      {
        label: '📌 Hazmat',
        value: [
          { label: 'EUCF_SDLP_ALL_BTS_Dangerous Goods Test', value: 'EUCF_SDLP_ALL_BTS_Dangerous Goods Test', tag: 'SDLP' }
        ]
      },
      {
        label: '📌 Pit Safety High',
        value: [
          { label: 'EUCF_ ILT_ALL_PIT Safety_High', value: 'EUCF_ ILT_ALL_PIT Safety_High', tag: 'ATA' }
        ]
      },
      {
        label: '📌 SLOT',
        value: [
          { label: 'EUTOM_SDLP SLOT Test', value: 'EUTOM_SDLP SLOT Test', tag: 'SDLP' },
          { label: 'EUTOM_ILT/SDLP_SLOT Training', value: 'EUTOM_ILT/SDLP_SLOT Training', tag: 'ATA' },
          { label: 'EUCF_SDLP_SLOT L4+', value: 'EUCF_SDLP_SLOT L4+', tag: ['L4+','SDLP'] }
        ]
      },
      {
        label: '📌 Yard Access',
        value: [
          { label: 'EUTOM_SDLP_Yard Access Training', value: 'EUTOM_SDLP_Yard Access Training', tag: 'SDLP' }
        ]
      },
      {
        label: '📌 Jambuster',
        value: [
          { label: 'EUCF_SDLP_ALL_Jambuster-Test', value: 'EUCF_SDLP_ALL_Jambuster-Test', tag: 'SDLP' },
          { label: 'EUCF_ ILT_ALL_Jambuster', value: 'EUCF_ ILT_ALL_Jambuster', tag: 'ATA' },
          { label: 'EUCF_ ILT_ALL_Jambuster Practical', value: 'EUCF_ ILT_ALL_Jambuster Practical', tag: 'ATA' },
          { label: 'EUCF_ILT_ALL_Jambuster D', value: 'EUCF_ILT_ALL_Jambuster D', tag: ['RME','ATA'] },
          { label: 'EUCF_SDLP_ALL_Jambuster L4+', value: 'EUCF_SDLP_ALL_Jambuster L4+', tag: 'ATA' }
        ]
      },
      {
        label: '📌 OB Carts',
        value: [
          { label: 'EUCF_ILT/SDLP_Outbound cart', value: 'EUCF_ILT/SDLP_Outbound cart', tag: 'ATA' }
        ]
      },
      {
        label: '📌 Food Safety',
        value: [
          { label: 'EUCF_SDLP_APU Food Safety Self Check', value: 'EUCF_SDLP_APU Food Safety Self Check', tag: 'SDLP' },
          { label: 'EUCF_ILT_APU Food Safety', value: 'EUCF_ILT_APU Food Safety', tag: 'ATA' },
          { label: 'EUCF_APU_ALL_Food Safety', value: 'EUCF_APU_ALL_Food Safety', tag: ['APU','ATA'] }
        ]
      },
    ],
    refresh: [
      {
        label: '🎯 Dock Safety',
        value: [
          { label: 'EUCF_SDLP_ALL_Dock Safety Refresher', value: 'EUCF_SDLP_ALL_Dock Safety Refresher', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 Hazmat',
        value: [
          { label: 'Dangerous Goods (DG): General Awareness [TD-ORC]', value: 'Dangerous Goods (DG): General Awareness [TD-ORC]', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 Pit Safety High',
        value: [
          { label: 'EUCF_ SDLP_ALL_PIT Safety High Refresher', value: 'EUCF_ SDLP_ALL_PIT Safety High Refresher', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 Jambuster',
        value: [
          { label: 'EUCF_SDLP_ALL_Jambuster-Test', value: 'EUCF_SDLP_ALL_Jambuster-Test', tag: 'SDLP' },
          { label: 'EUCF_ ILT_ALL_Jambuster', value: 'EUCF_ ILT_ALL_Jambuster', tag: 'ATA' },
          { label: 'EUCF_ ILT_ALL_Jambuster Practical', value: 'EUCF_ ILT_ALL_Jambuster Practical', tag: 'ATA' },
          { label: 'EUCF_ILT_ALL_Jambuster D', value: 'EUCF_ILT_ALL_Jambuster D', tag: ['RME','ATA'] },
          { label: 'EUCF_SDLP_ALL_Jambuster L4+', value: 'EUCF_SDLP_ALL_Jambuster L4+', tag: 'ATA' }
        ]
      },
      {
        label: '🎯 SLOT',
        value: [
          { label: 'EUTOM_SDLP SLOT Test', value: 'EUTOM_SDLP SLOT Test', tag: 'SDLP' },
          { label: 'EUTOM_ILT/SDLP_SLOT Training', value: 'EUTOM_ILT/SDLP_SLOT Training', tag: 'ATA' },
          { label: 'EUCF_SDLP_SLOT L4+', value: 'EUCF_SDLP_SLOT L4+', tag: ['L4+','SDLP'] }
        ]
      },
      {
        label: '🎯 Yard Access',
        value: [
          { label: 'EUTOM_SDLP_Yard Access Refresher', value: 'EUTOM_SDLP_Yard Access Refresher', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 OB Carts',
        value: [
          { label: 'EUCF_ILT/SDLP_Outbound cart', value: 'EUCF_ILT/SDLP_Outbound cart', tag: 'ATA' }
        ]
      },
      {
        label: '🎯 Indoor Marshall',
        value: [
          { label: 'EUCF_ SDLP_ALL_Indoor Marshall  ', value: 'EUCF_ SDLP_ALL_Indoor Marshall  ', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 Outdoor Marshall',
        value: [
          { label: 'EUTOM_SDLP_Outdoor Marshal Refresher', value: 'EUTOM_SDLP_Outdoor Marshal Refresher', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 Gatehouse Supervisor',
        value: [
          { label: 'EUTOM_SDLP_Gatehouse Associate Refresher', value: 'EUTOM_SDLP_Gatehouse Associate Refresher', tag: 'SDLP' }
        ]
      },
      {
        label: '🎯 Food Safety',
        value: [
          { label: 'EUCF_SDLP_APU Food Safety Self Check', value: 'EUCF_SDLP_APU Food Safety Self Check', tag: 'SDLP' },
          { label: 'EUCF_ILT_APU Food Safety', value: 'EUCF_ILT_APU Food Safety', tag: 'ATA' },
          { label: 'EUCF_APU_ALL_Food Safety', value: 'EUCF_APU_ALL_Food Safety', tag: ['APU','ATA'] }
        ]
      },
    ],
    bts: [
      {
        label: '🚀 BTS Onboarding',
        value: [
          { label: 'EUCF_ILT_ITALY_BTS_VIRTUAL_DAY_0  ', value: 'EUCF_ILT_ITALY_BTS_VIRTUAL_DAY_0  ', tag: 'ATA' },
          { label: 'EUCF_ILT_ALL_BTS_FLOOR_READY', value: 'EUCF_ILT_ALL_BTS_FLOOR_READY', tag: 'ATA' },
          { label: 'EUCF_ILT_ALL_BTS_PROCESS_AREA_TOUR', value: 'EUCF_ILT_ALL_BTS_PROCESS_AREA_TOUR', tag: 'ATA' },
          { label: 'EUCF_ILT_ALL_BTS_SAFETY_WALK', value: 'EUCF_ILT_ALL_BTS_SAFETY_WALK', tag: 'ATA' },
          { label: 'EUCF_ILT_ALL_BTS_RSG', value: 'EUCF_ILT_ALL_BTS_RSG', tag: 'ATA' },
        ]
      },
      {
        label: '🚀 Dock Safety',
        value: [
          { label: 'EUCF_ SDLP_ALL_Dock Safety Test', value: 'EUCF_ SDLP_ALL_Dock Safety Test', tag: 'SDLP' },
          { label: 'EUCF_ ILT/SDLP_ALL_Dock Safety Training', value: 'EUCF_ ILT/SDLP_ALL_Dock Safety Training', tag: 'ATA' }
        ]
      },
      {
        label: '🚀 Hazmat',
        value: [
          { label: 'EUCF_SDLP_ALL_BTS_Dangerous Goods Test', value: 'EUCF_SDLP_ALL_BTS_Dangerous Goods Test', tag: 'SDLP' }
        ]
      },
      {
        label: '🚀 SLOT',
        value: [
          { label: 'EUTOM_SDLP SLOT Test', value: 'EUTOM_SDLP SLOT Test', tag: 'SDLP' },
          { label: 'EUTOM_ILT/SDLP_SLOT Training', value: 'EUTOM_ILT/SDLP_SLOT Training', tag: 'ATA' }
        ]
      },
    ],
    /* Scheda rimanente aggiunta in precedenza */
    change: [
      // Aggiungi qui i tuoi item per Change Announcement
      // Esempio:
      // { label: '📣 Comunicazioni', value: [ { label: 'Change - Nuovo processo ...', value: 'Change - Nuovo processo ...', tag: 'SDLP' } ] }
    ]
  };

  let state = { currentBook: 'prima', books: DEFAULT_BOOKS };

  /* =======================
        STILI
     ======================= */
  const styleTag = document.createElement('style');
  styleTag.id = 'certPanelStyles';
  styleTag.textContent = `
    :root{
      --panel-bg:#fff; --panel-border:#e5e5ea; --radius:16px;
      --header-bg:#0b0b0c; --header-fg:#fff; --accent:#007aff;
      --text:#0b0b0c; --muted:#6f6f73; --chip-bg:#f6f6f7;
      --font:-apple-system,system-ui,Segoe UI,Roboto,Arial,sans-serif;
      --badge-h:22px; --badge-px:10px;
    }
    #certPanel{
      position:fixed;top:80px;right:24px;width:560px;max-height:85vh;
      background:var(--panel-bg);border:1px solid var(--panel-border);
      border-radius:var(--radius);box-shadow:0 10px 30px rgba(0,0,0,.08);
      z-index:999999;display:none;overflow:hidden;font-family:var(--font);font-size:16px;
    }
    #certPanel.show{display:flex;flex-direction:column;}
    #certPanelHeader{
      cursor:move;padding:12px 14px;background:var(--header-bg);color:var(--header-fg);
      display:flex;align-items:center;justify-content:space-between;
    }

    /* tabs */
    .tabs{display:flex;gap:8px;padding:10px 12px 0;background:var(--panel-bg);flex-wrap:wrap}
    .tab{
      padding:8px 12px;border:1px solid var(--panel-border);border-bottom:none;
      border-top-left-radius:10px;border-top-right-radius:10px;
      background:#f5f5f5;color:#111827;font-weight:600;cursor:pointer;
      transition:all 0.25s ease;
    }
    .tab:hover{filter:brightness(0.97);}
    .tab.active[data-book="prima"]{ background:#ede9fe; color:#4c1d95; border-color:#c4b5fd; }
    .tab.active[data-book="refresh"]{ background:#fef3c7; color:#92400e; border-color:#fcd34d; }
    .tab.active[data-book="bts"]{ background:#cffafe; color:#155e75; border-color:#67e8f9; }
    .tab.active[data-book="change"]{ background:#ffe4e6; color:#9f1239; border-color:#fecdd3; }

    #certPanelBody{
      padding:12px;display:flex;flex-direction:column;gap:12px;overflow:auto;
      border-top:1px solid var(--panel-border);
    }
    .toolbar input{
      width:100%;padding:12px 14px;border:1px solid var(--panel-border);
      border-radius:10px;font-size:16px;
    }

    .list{display:flex;flex-direction:column;gap:10px;}
    .item{
      border:1px solid var(--panel-border);border-radius:12px;padding:10px;
      display:flex;flex-direction:column;gap:6px;background:#fff;
    }
    .itemLabel{font-weight:700;font-size:16px;color:var(--text);}
    .subList{display:flex;flex-direction:column;gap:6px;}
    .subItem{
      padding:8px 10px;background:var(--chip-bg);border-radius:10px;
      cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:space-between;
      gap:12px;
    }
    .subItem .badges{ display:flex; align-items:center; gap:6px; }

    /* BADGE laterali (altezza uniforme) */
    #certPanel .badge{
      display:inline-flex; align-items:center; justify-content:center;
      height:var(--badge-h); line-height:var(--badge-h);
      padding:0 var(--badge-px);
      font-size:13px; font-weight:700; white-space:nowrap;
      border-radius:999px; border:1px solid transparent; vertical-align:middle;
    }
    .muted{color:var(--muted);font-size:14px;}

    #certPanelToggle{
      position:fixed;right:24px;bottom:24px;border:none;border-radius:999px;
      padding:14px 18px;background:var(--accent);color:#fff;cursor:pointer;z-index:999999;
      box-shadow:0 10px 30px rgba(37,99,235,.45);font-weight:700;font-size:16px;
    }
    #certPanelToggle:hover{filter:brightness(1.1);}
  `;
  document.head.appendChild(styleTag);

  /* =======================
        UI
     ======================= */
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'certPanelToggle';
  toggleBtn.textContent = 'Certificati';
  toggleBtn.title = 'Apri/chiudi (Alt+Shift+C)';
  document.body.appendChild(toggleBtn);

  const panel = document.createElement('div');
  panel.id = 'certPanel';
  panel.innerHTML = `
    <div id="certPanelHeader">
      <div class="title" style="font-weight:700;">Certificati</div>
      <div class="actions"><button id="btnClose" title="Chiudi">✕</button></div>
    </div>
    <div class="tabs">
      <div class="tab" id="tabPrima" data-book="prima">Prima assegnazione</div>
      <div class="tab" id="tabRefresh" data-book="refresh">Refresh</div>
      <div class="tab" id="tabBTS" data-book="bts">BTS</div>
      <div class="tab" id="tabChange" data-book="change">Change Announcement</div>
    </div>
    <div id="certPanelBody">
      <div class="toolbar"><input id="searchInput" type="text" placeholder="Cerca..." /></div>
      <div class="list" id="itemsList"></div>
      <div class="muted">Clic = inserisci nel campo attivo • Doppio clic = copia.</div>
    </div>
  `;
  document.body.appendChild(panel);

  /* =======================
        FUNZIONI
     ======================= */
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function attrEncode(s){ return encodeURIComponent(String(s)); }
  function attrDecode(s){ try { return decodeURIComponent(String(s||'')); } catch { return String(s||''); } }

  // calcola i tag visibili a destra (aggiunge L4+ se presente nel titolo)
  function computeTags(entry){
    const base = Array.isArray(entry.tag) ? [...entry.tag] : (entry.tag ? [entry.tag] : []);
    if (/\bL4\+\b/i.test(entry.label || '')) {
      if (!base.includes('L4+')) base.push('L4+');
    }
    return base;
  }

  function badgesHtml(tags){
    const arr = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    return arr.map(k=>{
      const t = TAGS[k]; if(!t) return '';
      return `<span class="badge" data-badge="${t.label}" style="background:${t.bg};color:${t.fg};border-color:${t.brd}">${t.label}</span>`;
    }).join('');
  }

  function isEditable(el){return !!el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable);}
  function isInsidePanel(el){return panel.contains(el);}
  let lastEditable=null;
  document.addEventListener('focusin',e=>{
    if(isEditable(e.target)&&!isInsidePanel(e.target)) lastEditable=e.target;
  },true);

  function getTargetEditable(){
    const ae=document.activeElement;
    if(isEditable(ae)&&!isInsidePanel(ae))return ae;
    if(isEditable(lastEditable))return lastEditable;
    return null;
  }

  function insertIntoField(text){
    const el=getTargetEditable(); if(!el) return false;
    if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
      const s=el.selectionStart??el.value.length; const e=el.selectionEnd??el.value.length;
      const before=el.value.slice(0,s); const after=el.value.slice(e);
      el.value=before+text+after; const newPos=s+text.length;
      el.selectionStart=el.selectionEnd=newPos; el.dispatchEvent(new Event('input',{bubbles:true})); el.focus(); return true;
    }
    if(el.isContentEditable){el.innerText+=text;el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();return true;}
    return false;
  }

  function copyText(text){
    try { if (typeof GM_setClipboard === 'function') { GM_setClipboard(text,{type:'text'}); toast('Copiato!'); return; } } catch {}
    navigator.clipboard?.writeText(text).then(()=>toast('Copiato!')).catch(()=>toast('Impossibile copiare'));
  }

  function toast(msg,timeout=1500){
    const t=document.createElement('div');
    Object.assign(t.style,{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',
      background:'#111827',color:'#fff',padding:'10px 14px',borderRadius:'999px',fontSize:'14px',zIndex:999999});
    t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),timeout);
  }

  /* =======================
        RENDER LIST
     ======================= */
  function matchesFilter(it,n){
    if(!n)return true;
    if(it.label?.toLowerCase().includes(n))return true;
    if(typeof it.value==='string')return it.value.toLowerCase().includes(n);
    if(Array.isArray(it.value))return it.value.some(s=>
      (s.label&&s.label.toLowerCase().includes(n))||(s.value&&s.value.toLowerCase().includes(n)));
    return false;
  }
  function activeBookItems(){return state.books[state.currentBook]||[];}
  function setActiveBook(b){state.currentBook=b;renderList(document.getElementById('searchInput').value);updateTabs();}

  // Evidenziazione dinamica per qualsiasi tab presente
  function updateTabs(){
    document.querySelectorAll('.tab').forEach(el=>{
      el.classList.toggle('active', el.dataset.book === state.currentBook);
    });
  }

  function renderList(f=''){
    const list=document.getElementById('itemsList'); list.innerHTML='';
    const n=f.trim().toLowerCase();
    const items=activeBookItems().filter(it=>matchesFilter(it,n));
    if(!items.length){list.innerHTML='<div class="muted">Nessun elemento trovato.</div>';return;}

    items.forEach(it=>{
      const card=document.createElement('div'); card.className='item';

      // Gruppo con sotto-voci
      if(Array.isArray(it.value)){
        const labelEl=document.createElement('div');
        labelEl.className='itemLabel';
        labelEl.textContent=it.label||'';
        card.appendChild(labelEl);

        const subList=document.createElement('div'); subList.className='subList';

        it.value.forEach(s=>{
          const sub=document.createElement('div'); sub.className='subItem';
          // conserva l'intero valore del certificato in data-value (URL encoded)
          const val=(typeof s.value==='string' && s.value) ? s.value : (s.label||'');
          sub.dataset.value = attrEncode(val);

          const left=document.createElement('span');
          left.textContent=s.label||'';

          const right=document.createElement('div');
          right.className='badges';
          right.innerHTML=badgesHtml(computeTags(s));

          sub.appendChild(left);
          sub.appendChild(right);
          subList.appendChild(sub);
        });

        card.appendChild(subList);
      }
      // Voce singola (stringa)
      else{
        const row=document.createElement('div'); row.className='subItem';
        row.dataset.value=attrEncode(String(it.value||it.label||''));

        const left=document.createElement('span'); left.className='itemLabel';
        left.textContent=it.label||'';

        const right=document.createElement('div'); right.className='badges';
        right.innerHTML=badgesHtml(computeTags(it));

        row.appendChild(left); row.appendChild(right);
        card.appendChild(row);

        const val=document.createElement('div'); val.className='itemValue';
        val.textContent=String(it.value||'');
        card.appendChild(val);
      }

      list.appendChild(card);
    });
  }

  /* =======================
        EVENTI
     ======================= */
  toggleBtn.addEventListener('click',()=>panel.classList.toggle('show'));
  document.addEventListener('keydown',e=>{if(e.altKey&&e.shiftKey&&(e.key==='C'||e.key==='c'))panel.classList.toggle('show');});
  document.getElementById('btnClose').addEventListener('click',()=>panel.classList.remove('show'));
  document.getElementById('searchInput').addEventListener('input',e=>renderList(e.target.value));

  document.getElementById('tabPrima').addEventListener('click',()=>setActiveBook('prima'));
  document.getElementById('tabRefresh').addEventListener('click',()=>setActiveBook('refresh'));
  document.getElementById('tabBTS').addEventListener('click',()=>setActiveBook('bts'));
  document.getElementById('tabChange').addEventListener('click',()=>setActiveBook('change'));

  // Mantieni il focus sul campo attivo quando clicchi un certificato
  panel.addEventListener('mousedown', (e) => {
    if (e.target.closest('.subItem')) e.preventDefault();
  });

  const listEl = document.getElementById('itemsList');

  // Click: inserisce nel campo attivo
  listEl.addEventListener('click', (e) => {
    const sub = e.target.closest('.subItem');
    if (!sub) return;
    const value = attrDecode(sub.dataset.value || '');
    if (!value) return;

    const ok = insertIntoField(value);
    if (ok) toast('Inserito nel campo attivo');
    else toast('Nessun campo di input attivo');
  });

  // Doppio clic: copia negli appunti
  listEl.addEventListener('dblclick', (e) => {
    const sub = e.target.closest('.subItem');
    if (!sub) return;
    const value = attrDecode(sub.dataset.value || '');
    if (!value) return;
    copyText(value);
  });

  // avvio
  renderList();
  updateTabs();
})();
