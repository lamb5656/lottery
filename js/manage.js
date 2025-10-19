(function(){
  const $ = s => document.querySelector(s);
  const id = new URLSearchParams(location.search).get('id') || "";
  if(!id){ alert('id が必要です'); }

  async function call(path, opts={}){
    const res = await fetch(APP_CONFIG.BACKEND_BASE + path, opts);
    if(path.endsWith("/csv")) return res; // stream
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || res.status);
    return data;
  }

  function parseNumbers(text){
    const out = new Set();
    const parts = (text||"").split(",").map(s=>s.trim()).filter(Boolean);
    for(const p of parts){
      const m = p.match(/^(\d+)-(\d+)$/);
      if(m){
        let a=+m[1], b=+m[2];
        if(a>b) [a,b]=[b,a];
        for(let x=a;x<=b;x++) out.add(x);
      }else if(/^\d+$/.test(p)){
        out.add(+p);
      }
    }
    return [...out].sort((a,b)=>a-b);
  }

  async function loadAll(){
    const stats = await call(`/admin/lotteries/${id}/stats`);
    $('#summary').innerHTML = `<b>${stats.title}</b><br>総数: ${stats.total} / 使用済み: ${stats.used} / 残り: ${stats.remaining}`;

    const board = await call(`/admin/lotteries/${id}/board`);
    const grid = document.createElement('div');
    grid.className = 'grid cols-10';
    board.items.forEach(e=>{
      const d = document.createElement('div');
      d.className = 'cell' + (e.used ? ' used' : '');
      d.textContent = e.no + ' (' + e.rank + ')';
      grid.appendChild(d);
    });
    $('#board').innerHTML = ''; $('#board').appendChild(grid);

    const res = await call(`/admin/lotteries/${id}/results`);
    const rows = res.items;
    const html = [`<table><thead><tr><th>No</th><th>Rank</th><th>UsedAt</th><th>Name</th></tr></thead><tbody>`,
      ...rows.map(r => `<tr><td>${r.no}</td><td>${r.rank}</td><td>${r.usedAt? new Date(r.usedAt).toLocaleString(): ''}</td><td>${r.name||''}</td></tr>`),
      `</tbody></table>`].join('');
    $('#results').innerHTML = html;
  }

  async function assign(){
    const nums = parseNumbers($('#numbers').value);
    if(nums.length===0){ alert('番号を入力してください'); return; }
    const rank = $('#rank').value;
    await call(`/admin/lotteries/${id}/assign`, {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ numbers: nums, rank })
    });
    await loadAll();
  }

  async function dl(type){
    const res = await call(`/admin/lotteries/${id}/csv?type=${encodeURIComponent(type)}`);
    const text = await res.text();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:'text/csv'}));
    a.download = `lottery_${id}_${type}.csv`;
    a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    loadAll();
    $('#assign').addEventListener('click', assign);
    $('#csv-public').addEventListener('click', ()=> dl('public'));
    $('#csv-private').addEventListener('click', ()=> dl('private'));
  });
})();