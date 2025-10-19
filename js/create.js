(function () {
  const onReady = () => {
    const btnCreate = document.querySelector('#create');
    if (btnCreate) {
      btnCreate.addEventListener('click', createLottery);
    }
    const btnAddRank = document.querySelector('#add-rank');
    if (btnAddRank) {
      btnAddRank.addEventListener('click', addRankRow);
    }
  };

  function addRankRow() {
    const host = document.querySelector('#ranks') || document.querySelector('#more-ranks');
    if (!host) return;
    const div = document.createElement('div');
    div.className = 'row';
    div.innerHTML = `
      <input class="rank-name" type="text" placeholder="例: 4等" />
      <input class="rank-count" type="number" min="0" step="1" value="0" />
    `;
    host.appendChild(div);
  }

  async function createLottery(evt) {
    evt?.preventDefault?.();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
