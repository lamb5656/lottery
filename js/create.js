(function(){
  const $ = s => document.querySelector(s);
  document.querySelector('#add-rank').addEventListener('click', ()=>{
    const div = document.createElement('div');
    div.className='row';
    div.innerHTML = `<input class="rank-name" type="text" value="" placeholder="例: 4等" />
    <input class="rank-count" type="number" min="0" step="1" value="0" />`;
    document.querySelector('#ranks').appendChild(div);
  });

  function ranks(){
    const names = [...document.querySelectorAll('.rank-name')];
    const counts = [...document.querySelectorAll('.rank-count')];
    const arr = names.map((_,i)=>({ rank: names[i].value.trim(), count: parseInt(counts[i].value,10)||0 }));
    return arr.filter(x=>x.rank && x.count>0);
  }

  async function createLottery(){
    const title = $('#title').value.trim() || 'くじ';
    const total = Math.max(1, parseInt($('#total').value,10)||1);
    const rs = ranks();
    const sum = rs.reduce((a,b)=>a+b.count,0);
    if(sum>total){ alert(`当たり口数の合計(${sum})が総数(${total})を超えています。`); return; }

    const res = await fetch(APP_CONFIG.BACKEND_BASE + "/admin/lotteries", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ title, total, prizes: rs })
    });
    const data = await res.json();
    if(!res.ok){ alert('作成エラー: '+(data.error||res.status)); return; }
    const adminUrl = `./admin.html?id=${encodeURIComponent(data.lotteryId)}`;
    const sampleDraw = `./draw.html?code=${encodeURIComponent(data.exampleCode)}`;
    $('#output').classList.remove('hidden');
    $('#created').innerHTML = `Lottery ID: <b>${data.lotteryId}</b><br> 例のリンク: <a target="_blank" href="${sampleDraw}">${sampleDraw}</a><br><a href="${adminUrl}">管理画面を開く</a>`;
  }

  $('#create').addEventListener('click', createLottery);
})();