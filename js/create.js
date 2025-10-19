(function(){
  const $ = s => document.querySelector(s);
  async function createLottery(){
    const title = $('#title').value.trim() || 'くじ';
    const total = Math.max(1, parseInt($('#total').value,10)||1);
    const headers = { "content-type":"application/json" };
    // dev tokenは使わない（Access前提）。必要ならここに Authorization を足す。
    const res = await fetch(APP_CONFIG.BACKEND_BASE + "/admin/lotteries", {
      method:"POST", headers, body: JSON.stringify({ title, total })
    });
    const data = await res.json();
    if(!res.ok){ alert('エラー: ' + (data.error || res.status)); return; }
    $('#out').classList.remove('hidden');
    const admin = `./manage.html?id=${data.lotteryId}`;
    const pick = `./pick.html?id=${data.lotteryId}`;
    $('#info').innerHTML = `Lottery ID: <b>${data.lotteryId}</b><br>配布用リンク: <a target="_blank" href="${pick}">${pick}</a><br>→ <a href="${admin}">管理画面を開く</a>`;
  }
  document.querySelector('#create').addEventListener('click', createLottery);
})();