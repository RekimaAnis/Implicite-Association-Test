import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', async () => {
  const ctx = document.getElementById('myChart').getContext('2d');
  const voteChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Réponses utilisateurs',
        data: []
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  function updateChart(breakdown) {
    const category = document.getElementById('categorySelect').value;
    const options = schemaMeta.allowedValues?.[category];

    const fullBreakdown = {};
    if (Array.isArray(options) && options.length > 0) {
      options.forEach(opt => {
        fullBreakdown[opt] = breakdown[opt] || 0;
      });
    } else {
      Object.assign(fullBreakdown, breakdown);
    }

    voteChart.data.labels = Object.keys(fullBreakdown);
    voteChart.data.datasets[0].data = Object.values(fullBreakdown);
    voteChart.update();
  }

  let schemaMeta = null;

  async function fetchAndRender(category) {
    const options = schemaMeta.allowedValues?.[category];

    if (Array.isArray(options) && options.length > 0) {
      voteChart.data.labels = options;
      voteChart.data.datasets[0].data = options.map(() => 0);
    } else {
      voteChart.data.labels = [];
      voteChart.data.datasets[0].data = [];
    }
    voteChart.update();

    try {
      const res = await fetch(`/user/breakdown?category=${encodeURIComponent(category)}`);
      const { breakdown } = await res.json();

      updateChart(breakdown);

      document.getElementById('voteStatus').innerHTML =
        Object.entries(breakdown).map(([k, v]) => `${k}: ${v}`).join(' | ');
    } catch (err) {
      console.error("Erreur lors de la récupération du breakdown :", err);
    }
  }

  try {
    const res = await fetch('/user/schema');
    schemaMeta = await res.json();

    console.log('Schéma récupéré via API:', schemaMeta);

    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) {
      console.warn("Élément #categorySelect introuvable.");
      return;
    }

    categorySelect.innerHTML = '';

    schemaMeta.fields.forEach(field => {
      const option = document.createElement('option');
      option.value = field;
      option.textContent = field;
      categorySelect.appendChild(option);
    });

    if (schemaMeta.fields.length > 0) {
      categorySelect.value = schemaMeta.fields[0];
      await fetchAndRender(schemaMeta.fields[0]);
    }

    categorySelect.addEventListener('change', async (e) => {
      await fetchAndRender(e.target.value);
    });

  } catch (err) {
    console.error("Erreur lors de la récupération du schéma :", err);
  }

  document.getElementById('resetBtn').addEventListener('click', async () => {
    if (!confirm("Cette action va supprimer toutes les réponses utilisateurs. Continuer ?")) return;

    try {
      const res = await fetch('/user/reset', { method: 'DELETE' });
      if (!res.ok) throw new Error("Échec de la suppression");

      alert("Réponses supprimées.");
      document.getElementById('voterCounter').textContent = "Formulaires reçus : 0";

      const category = document.getElementById('categorySelect').value;
      const options = schemaMeta.allowedValues?.[category];

      if (Array.isArray(options) && options.length > 0) {
        voteChart.data.labels = options;
        voteChart.data.datasets[0].data = options.map(() => 0);
      } else {
        voteChart.data.labels = [];
        voteChart.data.datasets[0].data = [];
      }
      voteChart.update();

      document.getElementById('voteStatus').textContent = '';

    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Une erreur est survenue lors de la suppression.");
    }
  });
});