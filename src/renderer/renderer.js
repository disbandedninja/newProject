function optionHtml(options) {
  return options
    .map((option) => {
      const value = escapeHtml(option);
      return `<option value="${value}">${value}</option>`;
    })
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll(\"'\", '&#39;');
}

function renderIncidents(incidents) {
  const list = document.getElementById('incident-list');

  if (!incidents.length) {
    list.innerHTML = '<p>No incidents reported yet.</p>';
    return;
  }

  list.innerHTML = incidents
    .map(
      (incident) => `
      <article class="incident-item">
        <h3>${escapeHtml(incident.shortDescription)}</h3>
        <p><strong>Date/Time:</strong> ${escapeHtml(incident.occurredAt)}</p>
        <p><strong>Category:</strong> ${escapeHtml(incident.category)} | <strong>Severity:</strong> ${escapeHtml(incident.severity)} | <strong>Status:</strong> ${escapeHtml(incident.status)}</p>
        <p><strong>Location:</strong> ${escapeHtml(incident.location)}</p>
        <p><strong>People Involved:</strong> ${escapeHtml(incident.peopleInvolved)}</p>
        <p><strong>Details:</strong> ${escapeHtml(incident.detailedDescription)}</p>
        <p><strong>Impact:</strong> ${escapeHtml(incident.impact)}</p>
        ${incident.evidence ? `<p><strong>Evidence:</strong> ${escapeHtml(incident.evidence)}</p>` : ''}
        ${incident.actionsTaken ? `<p><strong>Actions Taken:</strong> ${escapeHtml(incident.actionsTaken)}</p>` : ''}
      </article>`
    )
    .join('');
}

async function loadIncidents(filters = {}) {
  const incidents = await window.incidentApi.listIncidents(filters);
  renderIncidents(incidents);
}

async function initialize() {
  const { severityOptions, statusOptions, categoryOptions } = await window.incidentApi.getOptions();

  document.getElementById('severity').insertAdjacentHTML('beforeend', optionHtml(severityOptions));
  document.getElementById('status').insertAdjacentHTML('beforeend', optionHtml(statusOptions));
  document.getElementById('category').insertAdjacentHTML('beforeend', optionHtml(categoryOptions));

  document.getElementById('filter-severity').insertAdjacentHTML('beforeend', optionHtml(severityOptions));
  document.getElementById('filter-status').insertAdjacentHTML('beforeend', optionHtml(statusOptions));
  document.getElementById('filter-category').insertAdjacentHTML('beforeend', optionHtml(categoryOptions));

  document.getElementById('incident-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    const result = await window.incidentApi.addIncident(payload);

    const formMessage = document.getElementById('form-message');
    if (!result.ok) {
      formMessage.textContent = result.error;
      formMessage.className = 'error';
      return;
    }

    formMessage.textContent = 'Incident report saved.';
    formMessage.className = 'success';
    event.target.reset();
    await loadIncidents();
  });

  document.getElementById('filter-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    await loadIncidents({
      severity: document.getElementById('filter-severity').value,
      status: document.getElementById('filter-status').value,
      category: document.getElementById('filter-category').value
    });
  });

  await loadIncidents();
}

initialize();
