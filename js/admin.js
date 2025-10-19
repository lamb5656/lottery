(function(){
  const $ = s => document.querySelector(s);
  let lid = "";

  async function call(path, opts={}){
    const res = await fetch(APP_CONFIG.BACKEND_BASE + path, opts);
    if(path.endsWith("/links")){
      return res.json();
    } else {
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || res.status);
      return data;
    }
  }

  function getIdFromQuery(){
    const p = new URLSearchParams(location.search);
    return p.get('id') || '';
  }

  function publicBase(){
    // Build Pages origin base for link composition
    const u = new URL(location.href);
    // assume /pages/ is the directory root for files
    const base = u.origin + u.pathname.replace(/admin\.html.*$/,'').replace(/\/$/,''); // .../pages
    return base;
  }

  async function load(){
    lid = $('#lottery-id').value.trim() || getIdFromQuery();
    if(!lid){ alert('Lottery ID を入力してください'); return; }
    $('#lottery-id').value = lid;

    const stats = await call(`/admin/lotteries/${lid}/stats`, { method:"GET" });
    $('#stats-sec').classList.remove('hidden');
    $('#results-sec').classList.remove('hidden');
    $('#ops-sec').classList.remove('hidden');
    $('#stats-box').innerHTML = `
      <b>${stats.title}</b><br>
      総数: ${stats.total} / 使用済み: ${stats.used} / 残り: ${stats.remaining}
      <hr/>
      ${Object.entries(stats.perRank).map(([rank, v])=> `${rank}: ${v.used} / ${v.total}`).join('<br>')}
    `;

    const res = await call(`/admin/lotteries/${lid}/results`, { method:"GET" });
    const rows = res.items;
    const table = [`<table><thead><tr><th>#</th><th>コード</th><th>ランク</th><th>使用</th><th>使用日時</th><th>名前</th></tr></thead><tbody>`,
      ...rows.map(r => `<tr><td>${r.idx+1}</td><td>${r.code}</td><td>${r.rank}</td><td>${r.used?'済':''}</td><td>${r.usedAt? new Date(r.usedAt).toLocaleString(): ''}</td><td>${r.name||''}</td></tr>`),
      `</tbody></table>`
    ].join('');
    $('#results').innerHTML = table;

    // Build CSV client-side using /links (codes only)
    const codesResp = await call(`/admin/lotteries/${lid}/links`, { method:"GET" });
    const codes = codesResp.codes || [];
    const base = publicBase();
    const pubLines = [["No","Link"], ...codes.map((c,i)=> [String(i+1), `${base}/draw.html?code=${c}`])];
    const privLines = [["No","Link","Rank"], ...codes.map((c,i)=>{
      const row = rows.find(x=>x.code===c);
      const rank = row ? row.rank : ""; // rank unknown for未使用; 管理CSVでは未使用は空欄に
      return [String(i+1), `${base}/draw.html?code=${c}`, rank];
    })];
    function csv(lines){ return lines.map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n"); }
    $('#csv-public').onclick = ()=>{
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv(pubLines)], {type:'text/csv'}));
      a.download = `lottery_${lid}_public.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
    };
    $('#csv-private').onclick = ()=>{
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv(privLines)], {type:'text/csv'}));
      a.download = `lottery_${lid}_private.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
    };
  }

  async function invalidate(){
    const code = $('#code').value.trim();
    if(!code){ alert('コードを入力'); return; }
    await call(`/admin/lotteries/${lid}/invalidate`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ code }) });
    alert('無効化しました');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const qid = getIdFromQuery();
    if(qid){ $('#lottery-id').value = qid; load(); }
    $('#load').addEventListener('click', load);
    $('#invalidate').addEventListener('click', invalidate);
  });
})();