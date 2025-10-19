(function(){
  const $ = s => document.querySelector(s);
  const log = (msg) => {
    console.log(msg);
    const el = $('#log');
    if (el) el.textContent = (el.textContent ? el.textContent + '\n' : '') + String(msg);
  };

  async function createLottery(e){
    e?.preventDefault?.();
    log('clicked #create');
    const title = $('#title')?.value?.trim() || 'くじ';
    const total = Math.max(1, parseInt($('#total')?.value,10) || 1);

    const url = APP_CONFIG.BACKEND_BASE + "/admin-api/lotteries";
    log("POST " + url);

    try{
      const res = await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        // GitHub Pages → Access保護の管理APIを叩くなら Cookie が要る。試すなら有効化にゃ
        credentials: "include",
        body: JSON.stringify({ title, total })
      });
      let data = null;
      try { data = await res.json(); } catch {}
      log("status: " + res.status + " body: " + JSON.stringify(data));
      if (!res.ok) throw new Error((data && (data.error || data.message)) || ('HTTP '+res.status));
      alert("作成OK: LotteryID=" + data.lotteryId);
    }catch(err){
      log("ERROR: " + err.message);
      alert("作成エラー: " + err.message);
    }
  }

  // DOM構築後に必ずイベントを張る（スマホでもOK）
  function init(){
    const btn = $('#create');
    log('init: #create exists=' + !!btn);
    if (!btn) return log('ERROR: #create not found');
    btn.addEventListener('click', createLottery, {passive:false});
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
