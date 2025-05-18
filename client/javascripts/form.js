const apiBase    = '/user';
const apiSchema  = '/user/schema/category';
const contentDiv = document.getElementById('content');
const form       = document.getElementById('userForm');
let schemaMeta   = null;

function showMessage(msg, isError = false) {
  contentDiv.innerHTML = `<div class="${isError?'error-message':'success-message'}">${msg}</div>`;
  setTimeout(() => contentDiv.innerHTML = '', 3000);
}

async function initForm() {
  try {
    const res = await fetch(apiSchema);
    const schema = await res.json();

    schemaMeta = {
      fields: schema.map(c => c.name),
      allowedValues: Object.fromEntries(
        schema.map(c => [c.name, c.type === 'String' ? c.allowedValues : null])
      )
    };

    schema.forEach(field => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('form-group');

      const label = document.createElement('label');
      label.htmlFor = field.name;
      label.textContent = field.name.charAt(0).toUpperCase() + field.name.slice(1);

      let input;
      if (field.type === 'String' && Array.isArray(field.allowedValues) && field.allowedValues.length > 0) {
        input = document.createElement('select');

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Choisir...';
        placeholder.disabled = true;
        placeholder.selected = true;
        input.appendChild(placeholder);

        field.allowedValues.forEach(val => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement('input');
        input.type = field.type === 'Number' ? 'number' : 'text';
      }

      input.id = field.name;
      input.name = field.name;
      input.required = true;

      wrapper.append(label, input);
      form.insertBefore(wrapper, form.querySelector('div').nextSibling);
    });
  } catch (e) {
    console.error(e);
    showMessage('Impossible de charger le formulaire', true);
  }
}

function collectData() {
  const data = {};
  schemaMeta.fields.forEach(field => {
    const el = document.getElementById(field);
    if (el) data[field] = el.value;
  });
  return data;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = collectData();

  for (const field of schemaMeta.fields) {
    const el = document.getElementById(field);
    if (!el || !el.value) {
      showMessage(`Le champ \"${field}\" est requis.`, true);
      return;
    }
  }

  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur serveur');
    }
    showMessage('Réponse envoyée avec succès');
    form.reset();
  } catch (err) {
    console.error(err);
    showMessage(err.message, true);
  }
});

document.addEventListener('DOMContentLoaded', initForm);