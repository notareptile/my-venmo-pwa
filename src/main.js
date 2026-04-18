// ─── State ───────────────────────────────────────────────
const transactions = [
  {
    id: 'hardcoded-1',
    displayName: 'Marcus Rashford',
    username: '@marcusrashford',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Rashford&background=f9f9fa&color=6c6f75&size=128',
    amount: '5.00',
    note: '⚽ good game bro',
    type: 'pay',
    time: new Date(Date.now() - 86400000).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    })
  },
  {
    id: 'hardcoded-2',
    displayName: 'William Kink',
    username: '@wkink',
    avatar: 'https://ui-avatars.com/api/?name=William+Kink&background=f9f9fa&color=6c6f75&size=128',
    amount: '10.00',
    note: 'hello will',
    type: 'pay',
    time: 'January 17, 2026, 1:13 AM'
  }
]

let uploadedPhotoDataURL = null

// ─── Helpers ─────────────────────────────────────────────
function formatAmount(amount) {
  const n = parseFloat(amount)
  const formatted = n % 1 === 0 ? `${n}` : `${n.toFixed(2)}`
  return `<span class="minus">−</span><span class="currency">$</span>${formatted}`
}

// ─── Screen Navigation ────────────────────────────────────
const screens = {
  home:         document.getElementById('screen-home'),
  newTx:        document.getElementById('screen-new-tx'),
  txDetail:     document.getElementById('screen-tx-detail'),
  confirmation: document.getElementById('screen-confirmation')
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'))
  screens[name].classList.add('active')
}

// ─── Feed Rendering ───────────────────────────────────────
function renderFeed() {
  const feed = document.getElementById('feed')
  feed.innerHTML = ''
  transactions.forEach((tx) => {
    const card = document.createElement('div')
    card.className = 'tx-card'
    card.innerHTML = `
      <img class="tx-avatar" src="${tx.avatar}" alt="avatar" />
      <div class="tx-info">
        <p class="tx-name">${tx.displayName}</p>
        <p class="tx-note">${tx.note}</p>
        <p class="tx-time">${tx.time}</p>
      </div>
      <div class="tx-amount tx-paid">${formatAmount(tx.amount)}</div>
    `
    card.addEventListener('click', () => {
      populateTxDetail(tx)
      showScreen('txDetail')
    })
    feed.appendChild(card)
  })
}

// ─── Home Screen ──────────────────────────────────────────
document.getElementById('btn-new-tx').addEventListener('click', () => {
  document.getElementById('input-username').value = ''
  document.getElementById('input-display-name').value = ''
  document.getElementById('input-amount').value = ''
  document.getElementById('input-note').value = ''
  document.getElementById('url-error').textContent = ''
  uploadedPhotoDataURL = null
  document.getElementById('photo-preview').style.display = 'none'
  showScreen('newTx')
})

// ─── Photo Upload ─────────────────────────────────────────
document.getElementById('input-photo').addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      uploadedPhotoDataURL = event.target.result
      document.getElementById('photo-preview').src = uploadedPhotoDataURL
      document.getElementById('photo-preview').style.display = 'block'
    }
    reader.readAsDataURL(file)
  }
})

function handleAction(type) {
  const usernameInput = document.getElementById('input-username').value.trim();
  const displayNameInput = document.getElementById('input-display-name').value.trim();
  const amount = parseFloat(document.getElementById('input-amount').value);
  const note = document.getElementById('input-note').value.trim() || 'Payment';
  const errEl = document.getElementById('url-error');

  // New: Get initials input
  const initialsInput = document.getElementById('input-initials').value.trim().toUpperCase();

  const username = usernameInput.replace(/^@/, '');

  if (!username) {
    errEl.textContent = 'Please enter a username';
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    errEl.textContent = 'Please enter a valid amount';
    return;
  }

  errEl.textContent = '';

  const displayName = displayNameInput || username;

  // ─── Avatar Priority Logic ────────────────────────────────
  let avatar;
  if (uploadedPhotoDataURL) {
    // 1. Use uploaded photo if it exists
    avatar = uploadedPhotoDataURL;
  } else if (initialsInput) {
    // 2. Use initials if photo is missing but initials are provided
    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(initialsInput)}&background=f9f9fa&color=6c6f75&size=128&font-size=0.45`;
  } else {
    // 3. Fallback to username if both are missing
    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=f9f9fa&color=6c6f75&size=128`;
  }

  const timeStr = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const tx = {
    id: '4512007650679777383',
    displayName,
    username: `@${username}`,
    avatar,
    amount: amount.toFixed(2),
    note,
    type,
    time: timeStr
  };

  // ─── Cleanup ─────────────────────────────────────────────
  // Clear the initials and photo data for the next transaction
  document.getElementById('input-initials').value = '';
  uploadedPhotoDataURL = null;
  if (document.getElementById('photo-preview')) {
    document.getElementById('photo-preview').style.display = 'none';
  }

  transactions.unshift(tx);
  renderFeed();
  populateConfirmation(tx);
  showScreen('confirmation');
}

document.getElementById('btn-pay').addEventListener('click', () => handleAction('pay'))
document.getElementById('btn-request').addEventListener('click', () => handleAction('request'))

// ─── Transaction Detail ───────────────────────────────────
document.getElementById('btn-back-from-detail').addEventListener('click', () => showScreen('home'))

function populateTxDetail(tx) {
  document.getElementById('detail-avatar').src            = tx.avatar
  document.getElementById('detail-name').textContent      = tx.displayName
  document.getElementById('detail-amount').innerHTML      = formatAmount(tx.amount)
  document.getElementById('detail-note').textContent      = `"${tx.note}"`
  document.getElementById('detail-time').innerHTML      = `${tx.time} · <span class="privacy-blue">Private</span>`
  document.getElementById('detail-paid-to').textContent   = tx.username
}

// ─── Confirmation Screen ───────────────────────────────────
document.getElementById('btn-back-from-confirm').addEventListener('click', () => {
  showScreen('home')
})

function populateConfirmation(tx) {
  document.getElementById('confirm-avatar').src            = tx.avatar
  document.getElementById('confirm-name').textContent      = tx.displayName
  document.getElementById('confirm-username').textContent  = tx.username
  document.getElementById('confirm-amount').innerHTML      = formatAmount(tx.amount)
  document.getElementById('confirm-note').textContent      = `"${tx.note}"`
  document.getElementById('confirm-time').innerHTML      = `${tx.time} · <span class="privacy-blue">Private</span>`
  document.getElementById('confirm-paid-to').textContent   = tx.username
  document.getElementById('confirm-type').textContent      = tx.type === 'pay' ? 'Payment Sent!' : 'Request Sent!'
}

// ─── Init ─────────────────────────────────────────────────
renderFeed()
showScreen('home')
