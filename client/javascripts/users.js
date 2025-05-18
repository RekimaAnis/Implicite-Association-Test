const apiBase = '/user/schema/category';

const contentDiv         = document.getElementById('content');
const categoryForm       = document.getElementById('categoryForm');
const categoryNameInput  = document.getElementById('categoryNameInput');
const categoryTypeInput  = document.getElementById('categoryTypeInput');
const categoriesList     = document.getElementById('categoriesList');

let categories = [];

function showMessage(text, isError = false) {
  contentDiv.innerHTML = `<div class="${isError ? 'error-message' : 'success-message'}">${text}</div>`;
  setTimeout(() => contentDiv.innerHTML = '', 3000);
}

async function loadCategories() {
  categoriesList.innerHTML = '';
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const cats = await res.json();
    categories = cats;

    cats.forEach(cat => {
      const section = document.createElement('section');
      section.className = 'category-section';

      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `<h3>${cat.name}</h3>`;

      if (cat.type === 'String') {
        const openBtn = document.createElement('button');
        openBtn.textContent = 'Ouvrir';
        openBtn.addEventListener('click', () => toggleValues(section, cat));
        header.appendChild(openBtn);
      } else {
        const info = document.createElement('em');
        info.textContent = ' (valeurs libres)';
        header.appendChild(info);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Supprimer';
      deleteBtn.addEventListener('click', async () => {
        if (!confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
        await fetch(`${apiBase}/${cat._id}`, { method: 'DELETE' });
        showMessage(`Catégorie "${cat.name}" supprimée`);
        loadCategories();
      });

      header.appendChild(deleteBtn);
      section.appendChild(header);

      const valueList = document.createElement('ul');
      valueList.className = 'value-list';
      valueList.style.display = 'none';
      section.appendChild(valueList);

      const addForm = document.createElement('form');
      addForm.className = 'add-value-form';
      addForm.innerHTML = `
        <input type="text" placeholder="Nouvelle(s) valeur(s) séparée(s) par des virgules" required />
        <button type="submit">Ajouter</button>
      `;
      addForm.style.display = 'none';

      addForm.addEventListener('submit', async e => {
        e.preventDefault();
        const input = addForm.querySelector('input');
        const newVals = input.value.split(',').map(v => v.trim()).filter(Boolean);
        if (newVals.length === 0) return;
        const current = new Set(cat.allowedValues || []);
        newVals.forEach(v => current.add(v));
        await updateValues(cat._id, [...current]);
        input.value = '';
      });

      section.appendChild(addForm);
      categoriesList.appendChild(section);
    });
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
}

function toggleValues(section, cat) {
  const ul = section.querySelector('.value-list');
  const form = section.querySelector('.add-value-form');

  if (ul.style.display === 'none') {
    ul.innerHTML = '';
    (cat.allowedValues || []).forEach(val => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = val;

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', async () => {
        const newVal = prompt('Modifier la valeur :', val);
        if (!newVal || !newVal.trim()) return;
        const updated = cat.allowedValues.map(v => v === val ? newVal.trim() : v);
        await updateValues(cat._id, [...new Set(updated)]);
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = ' 🗑️';
      delBtn.addEventListener('click', async () => {
        const updated = cat.allowedValues.filter(v => v !== val);
        await updateValues(cat._id, updated);
      });

      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
      ul.appendChild(li);
    });
    ul.style.display = 'block';
    form.style.display = 'flex';
  } else {
    ul.style.display = 'none';
    form.style.display = 'none';
  }
}

async function updateValues(id, allowedValues) {
  try {
    const res = await fetch(`${apiBase}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedValues })
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    showMessage('Valeurs mises à jour');
    loadCategories();
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
}

categoryForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = categoryNameInput.value.trim();
  const type = categoryTypeInput.value;
  if (!name || !type) return;

  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, allowedValues: [] })
    });
    if (!res.ok) throw new Error('Erreur lors de la création de la catégorie');
    categoryNameInput.value = '';
    showMessage('Catégorie ajoutée');
    loadCategories();
  } catch (err) {
    showMessage(err.message, true);
    console.error(err);
  }
});

document.addEventListener('DOMContentLoaded', loadCategories);
