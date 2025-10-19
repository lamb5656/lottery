(function(){
  const $ = s => document.querySelector(s);
  let turnstileToken = "";
  window.onTurnstile = t => { turnstileToken = t; };

  function getCode(){ return (new URLSearchParams(location.search)).get('code') || ''; }

  async function redeem(){
    $('#msg').textContent = '';
    const code = getCode();
    if(!code){ $('#msg').textContent = 'コードが見つかりません。正しいリンクからアクセスしてください。'; return; }
    const name = $('#name').value.trim();

    const el = document.getElementById('cf-turnstile');
    if(APP_CONFIG.TURNSTILE_SITE_KEY && !el.dataset.set){
      el.dataset.set = "1"; el.setAttribute('data-sitekey', APP_CONFIG.TURNSTILE_SITE_KEY);
    }

    const resp = await fetch(APP_CONFIG.BACKEND_BASE + "/redeem", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ code, name, turnstileToken })
    });
    const data = await resp.json();
    if(!resp.ok){ $('#msg').textContent = data.error || ('Error '+resp.status); return; }
    $('#form-sec').classList.add('hidden');
    $('#result-sec').classList.remove('hidden');
    const box = $('#result-box');
    box.textContent = data.rank;
    if(data.rank !== 'ハズレ') box.classList.add('win'); else box.classList.add('lose');
  }

  document.addEventListener('DOMContentLoaded', ()=> $('#draw').addEventListener('click', redeem));
})();