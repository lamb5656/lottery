(function(){
  const $ = s => document.querySelector(s);
  const id = new URLSearchParams(location.search).get('id') || "";

  async function load(){
    const sum = await (await fetch(APP_CONFIG.BACKEND_BASE + `/lotteries/${id}/summary`)).json();
    $('#sum').innerHTML = `<b>${sum.title}</b> / 総数: ${sum.total} / 使用済み: ${sum.used} / 残り: ${sum.remaining}`;

    const av = await (await fetch(APP_CONFIG.BACKEND_BASE + `/lotteries/${id}/available?offset=0&limit=200`)).json();
    const grid = document.createElement('div');
    grid.className = 'grid cols-10';
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
    $('#result-sec').classList.remove('hidden');
    $('#result').textContent = `あなたの番号: ${data.no} / 結果: ${data.rank}`;
    await load(); // refresh board/summary
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    load();
    $('#claim').addEventListener('click', claim);
  });
})();