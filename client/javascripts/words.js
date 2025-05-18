const apiWordBase = '/word';

const contentDiv      = document.getElementById('content');
const categoryForm    = document.getElementById('categoryForm');
const categorieInput  = document.getElementById('categorieInput');
const categoriesList  = document.getElementById('categoriesList');

const wordsModal      = document.getElementById('wordsModal');
const modalTitle      = document.getElementById('modalTitle');
const closeBtn        = document.querySelector('.close-btn');
const wordForm        = document.getElementById('wordForm');
const motInput        = document.getElementById('mot');
const saveWordBtn     = document.getElementById('saveWordBtn');
const wordsTable      = document.getElementById('wordsTable');

let categories = [];
let currentCategory = null;
let editingWordId = null;

function showMessage(text, isError = false) {
  contentDiv.innerHTML = `<div class="${isError ? 'error-message' : 'success-message'}">${text}</div>`;
  setTimeout(() => contentDiv.innerHTML = '', 3000);
}

async function loadCategories() {
  categoriesList.innerHTML = '';
  try {
    const res = await fetch(apiWordBase);
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const words = await res.json();
    const uniqueCats = [...new Set(words.map(w => w.categorie))];
    categories = uniqueCats;
    categories.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'category-item';
      div.innerHTML = `
        <span>${cat}</span>
        <div>
          <button data-action="open" data-cat="${cat}">Ouvrir</button>
          <button data-action="deleteCat" data-cat="${cat}">Supprimer</button>
        </div>
      `;
      categoriesList.appendChild(div);
    });
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
}

categoryForm.addEventListener('submit', async e => {
  e.preventDefault();
  const motInput = document.getElementById('motInput');
  const mots = motInput.value.split(',').map(m => m.trim()).filter(Boolean);
  const cat = categorieInput.value.trim();
  if (!cat || categories.includes(cat)) return;

  try {
    await Promise.all(mots.map(mot =>
      fetch(apiWordBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mot, categorie: cat })
      })
    ));
    categorieInput.value = '';
    motInput.value = '';
    showMessage('Catégorie ajoutée avec mot(s)');
    loadCategories();
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
});

categoriesList.addEventListener('click', e => {
  const btn = e.target;
  const action = btn.dataset.action;
  const cat    = btn.dataset.cat;
  if (!action || !cat) return;

  if (action === 'deleteCat') {
    if (!confirm(`Supprimer la catégorie "${cat}" et tous ses mots ?`)) return;
    fetch(apiWordBase)
      .then(res => res.json())
      .then(words => words.filter(w => w.categorie === cat))
      .then(wordsToDel => Promise.all(wordsToDel.map(w => fetch(`${apiWordBase}/${w._id}`, { method: 'DELETE' }))))
      .then(() => {
        showMessage(`Catégorie "${cat}" supprimée`);
        loadCategories();
      });
  }

  if (action === 'open') {
    currentCategory = cat;
    modalTitle.textContent = `Mots de la catégorie « ${cat} »`;
    wordsModal.style.display = 'flex';
    loadWords(cat);
  }
});

closeBtn.addEventListener('click', () => {
  wordsModal.style.display = 'none';
  wordForm.reset(); editingWordId = null; saveWordBtn.textContent = 'Ajouter';
});
window.addEventListener('click', e => {
  if (e.target === wordsModal) closeBtn.click();
});

async function loadWords(cat) {
  wordsTable.innerHTML = '';
  try {
    const res = await fetch(apiWordBase);
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const words = (await res.json()).filter(w => w.categorie === cat);
    words.forEach(w => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td contenteditable data-field="mot" data-id="${w._id}">${w.mot}</td>
        <td>
          <button data-action="update" data-id="${w._id}">Modifier</button>
          <button data-action="delete" data-id="${w._id}">Supprimer</button>
        </td>
      `;
      wordsTable.appendChild(tr);
    });
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
}

wordForm.addEventListener('submit', async e => {
  e.preventDefault();
  const mots = motInput.value.split(',').map(m => m.trim()).filter(Boolean);
  if (mots.length === 0 || !currentCategory) return;

  try {
    if (editingWordId) {
      const payload = { mot: mots[0], categorie: currentCategory };
      const res = await fetch(`${apiWordBase}/${editingWordId}`, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
    } else {
      await Promise.all(mots.map(mot =>
        fetch(apiWordBase, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ mot, categorie: currentCategory })
        })
      ));
    }

    showMessage(editingWordId ? 'Mot mis à jour' : 'Mot(s) ajouté(s)');
    wordForm.reset(); editingWordId = null; saveWordBtn.textContent = 'Ajouter';
    loadWords(currentCategory);
    loadCategories();
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
});

wordsTable.addEventListener('click', e => {
  const btn = e.target;
  const action = btn.dataset.action;
  const id     = btn.dataset.id;
  if (!action || !id) return;

  if (action === 'delete') {
    if (!confirm('Supprimer ce mot ?')) return;
    fetch(`${apiWordBase}/${id}`, { method: 'DELETE' })
      .then(() => {
        showMessage('Mot supprimé');
        loadWords(currentCategory);
        loadCategories();
      });
  }

  if (action === 'update') {
    const motCell = document.querySelector(`td[data-field="mot"][data-id="${id}"]`);
    motInput.value = motCell.textContent.trim();
    editingWordId = id;
    saveWordBtn.textContent = 'Mettre à jour';
  }
});

document.addEventListener('DOMContentLoaded', loadCategories);