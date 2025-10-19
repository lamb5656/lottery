(function(){
  const $ = s => document.querySelector(s);
  document.querySelector('#add-rank').addEventListener('click', ()=>{
    const div = document.createElement('div');
    div.className='row';
    div.innerHTML = `<input class="rank-name" type="text" value="" placeholder="例: 4等" />
    <input class="rank-count" type="number" min="0" step="1" value="0" />`;
    document.querySelector('#more-ranks').appendChild(div);
  });

  async function createLottery(){
    const title = $('#title').value.trim() || 'くじ';
    const total = Math.max(1, parseInt($('#total').value,10)||1);
    const token = $('#admin-token').value.trim();
    const publicBase = $('#public-base').value.trim();
    const ranks = [...document.querySelectorAll('.rank-name')].map((_,i)=>{
      const name = document.querySelectorAll('.rank-name')[i].value.trim();
      const count = parseInt(document.querySelectorAll('.rank-count')[i].value,10)||0;
      return { rank: name, count };
    }).filter(x => x.rank && x.count>0);

    const sum = ranks.reduce((a,b)=>a+b.count,0);
    if(sum>total){ alert(`当たり口数の合計(${sum})が総数(${total})を超えています。`); return; }
    if(!publicBase){ alert('公開ベースURLを入力してください'); return; }
    if(!token){ alert('管理トークンを入力してください'); return; }

    const resp = await fetch(APP_CONFIG.BACKEND_BASE + "/admin/lotteries", {
      method:"POST",
      headers:{ "content-type":"application/json", "authorization":"Bearer "+token },
      body: JSON.stringify({ title, total, prizes: ranks, publicBase })
    });
    const data = await resp.json();
    if(!resp.ok){ alert('作成エラー: '+(data.error||resp.status)); return; }
    $('#output').classList.remove('hidden');
    $('#created').innerHTML = `Lottery ID: <b>${data.lotteryId}</b><br> 例のリンク: <a target="_blank" href="${data.exampleLink}">${data.exampleLink}</a>`;
  }

  document.querySelector('#create').addEventListener('click', createLottery);
})();