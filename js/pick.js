(function(){
  const $ = s => document.querySelector(s);
  const id = new URLSearchParams(location.search).get('id') || "";
  if(!id){ alert('URLに ?id= が必要です'); }

  async function load(){
    const sres = await fetch(APP_CONFIG.BACKEND_BASE + `/lotteries/${id}/summary`);
    const sum = await sres.json();
    $('#sum').innerHTML = `<b>${sum.title}</b> / 総数: ${sum.total} / 使用済み: ${sum.used} / 残り: ${sum.remaining}`;

    const ares = await fetch(APP_CONFIG.BACKEND_BASE + `/lotteries/${id}/available?offset=0&limit=200`);
    const av = await ares.json();
    const grid = document.createElement('div'); grid.className = 'grid cols-10';
    av.available.forEach(no => {
      const d = document.createElement('div');
      d.className = 'cell';
      d.textContent = no;
      d.onclick = ()=> { $('#number').value = no; };
      grid.appendChild(d);
    });
    $('#grid').innerHTML = ''; $('#grid').appendChild(grid);
  }

  async function claim(){
    const name = $('#name').value.trim();
    const number = parseInt($('#number').value,10);
    if(!number){ alert('番号を入力してください'); return; }
    const res = await fetch(APP_CONFIG.BACKEND_BASE + `/lotteries/${id}/claim`, {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ number, name })
    });
    const data = await res.json();
    if(!res.ok){ alert(data.error || ('Error '+res.status)); return; }
    $('#result-sec').style.display = 'block';
    $('#result').textContent = `あなたの番号: ${data.no} / 結果: ${data.rank}`;
    await load();
  }

  function init(){
    load();
    const btn = document.querySelector('#claim'); if (btn) btn.addEventListener('click', claim);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();