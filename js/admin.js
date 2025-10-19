(function(){
  const $ = s => document.querySelector(s);
  let token = "", lid = "";

  async function call(path, opts={}){
    opts.headers = { ...(opts.headers||{}), "authorization": "Bearer "+token };
    const res = await fetch(APP_CONFIG.BACKEND_BASE + path, opts);
    if(path.endsWith("/links")){
      return res;
    } else {
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || res.status);
      return data;
    }
  }

  async function load(){
    token = $('#admin-token').value.trim();
    lid = $('#lottery-id').value.trim();
    if(!token || !lid){ alert('管理トークンとLottery IDを入力してください'); return; }

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
  }

  async function dl(type){
    const res = await call(`/admin/lotteries/${lid}/links?type=${encodeURIComponent(type)}`, { method:"GET" });
    const text = await res.text();
    const blob = new Blob([text], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lottery_${lid}_${type}.csv`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  }

  async function invalidate(){
    const code = $('#code').value.trim();
    if(!code){ alert('コードを入力'); return; }
    await call(`/admin/lotteries/${lid}/invalidate`, {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ code })
    });
    alert('無効化しました');
  }

  $('#load').addEventListener('click', load);
  $('#csv-public').addEventListener('click', ()=> dl('public'));
  $('#csv-private').addEventListener('click', ()=> dl('private'));
  $('#invalidate').addEventListener('click', invalidate);
})();