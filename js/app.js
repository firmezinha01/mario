/**
 * Controlador Principal do Aplicativo Mario Driver Pro
 */

import { RideCalculator } from './calculator.js';
import { SettingsManager, DEFAULT_SETTINGS } from './settings.js';
import { OverlaySimulator, SAMPLE_RIDES } from './overlay.js';

let settings = SettingsManager.getSettings();
let calculator = new RideCalculator(settings);
let overlaySim = null;

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar tema e configurações visuais
  SettingsManager.applyTheme(settings);
  applyBranding(settings);

  // Inicializar Simulador de Overlay
  overlaySim = new OverlaySimulator(calculator, handleRideAction);

  // Configurar Abas de Navegação
  setupTabs();

  // Configurar Formulário da Calculadora
  setupCalculator();

  // Configurar Simulador de Corridas
  setupSimulator();

  // Configurar Formulário de Configurações
  setupSettingsForm();

  // Renderizar Histórico de Viagens
  renderTripHistory();

  // Atualizar métricas do Dashboard
  updateDashboardStats();
});

function applyBranding(s) {
  document.querySelectorAll('.app-title-display').forEach(el => el.textContent = s.appName);
  document.querySelectorAll('.app-tagline-display').forEach(el => el.textContent = s.tagline || 'Drive Smart, Earn More');
  document.querySelectorAll('.driver-name-display').forEach(el => el.textContent = s.driverName || 'Motorista Parceiro');
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active', 'text-white'));
      btn.classList.add('active', 'text-white');

      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
}

function setupCalculator() {
  const priceInput = document.getElementById('calc-price');
  const pickupInput = document.getElementById('calc-pickup');
  const tripInput = document.getElementById('calc-trip');
  const timeInput = document.getElementById('calc-time');

  function runCalc() {
    const data = {
      price: parseFloat(priceInput.value) || 0,
      pickupKm: parseFloat(pickupInput.value) || 0,
      tripKm: parseFloat(tripInput.value) || 0,
      timeMinutes: parseFloat(timeInput.value) || 1
    };

    const res = calculator.calculate(data);

    // Atualizar UI
    document.getElementById('res-gross-km').textContent = `R$ ${res.grossPerKm.toFixed(2)}`;
    document.getElementById('res-gross-hour').textContent = `R$ ${res.grossPerHour.toFixed(2)}`;
    document.getElementById('res-net-profit').textContent = `R$ ${res.netProfit.toFixed(2)}`;
    document.getElementById('res-total-cost').textContent = `R$ ${res.totalCost.toFixed(2)}`;
    document.getElementById('res-margin').textContent = `${res.marginPercent.toFixed(0)}%`;

    const verdictBadge = document.getElementById('res-verdict-badge');
    verdictBadge.textContent = res.badge.text;
    verdictBadge.style.backgroundColor = res.badge.bg;
    verdictBadge.style.color = res.badge.color;
    verdictBadge.style.borderColor = res.badge.border;

    const reasonsList = document.getElementById('res-reasons-list');
    reasonsList.innerHTML = res.reasons.map(r => `<li class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full" style="background-color: ${res.badge.color};"></span>${r}</li>`).join('');
  }

  [priceInput, pickupInput, tripInput, timeInput].forEach(inp => {
    inp.addEventListener('input', runCalc);
  });

  // Botão de salvar simulação no histórico
  document.getElementById('btn-save-simulation')?.addEventListener('click', () => {
    const data = {
      app: 'Simulação Manual',
      price: parseFloat(priceInput.value) || 0,
      pickupKm: parseFloat(pickupInput.value) || 0,
      tripKm: parseFloat(tripInput.value) || 0,
      timeMinutes: parseFloat(timeInput.value) || 1
    };
    const res = calculator.calculate(data);
    SettingsManager.saveTrip({
      ...data,
      ...res,
      status: 'SIMULATED'
    });
    renderTripHistory();
    updateDashboardStats();
    alert('Simulação gravada no histórico de viagens!');
  });

  runCalc();
}

function setupSimulator() {
  const container = document.getElementById('sample-rides-buttons');
  if (!container) return;

  container.innerHTML = SAMPLE_RIDES.map((ride, idx) => `
    <button class="sample-ride-trigger p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition active:scale-95 flex items-center justify-between" data-index="${idx}">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full ${ride.price > 20 ? 'bg-emerald-400' : 'bg-orange-400'}"></span>
        <div>
          <div class="text-xs font-bold text-white">${ride.app} • R$ ${ride.price.toFixed(2)}</div>
          <div class="text-[11px] text-slate-400 truncate max-w-[170px]">${ride.destination}</div>
        </div>
      </div>
      <span class="text-xs font-mono font-bold text-orange-400">Tocar 🔔</span>
    </button>
  `).join('');

  container.querySelectorAll('.sample-ride-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const ride = SAMPLE_RIDES[idx];
      overlaySim.showRide(ride);
    });
  });
}

function handleRideAction(action, rideData, result) {
  SettingsManager.saveTrip({
    ...rideData,
    ...result,
    status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
  });
  renderTripHistory();
  updateDashboardStats();
}

function renderTripHistory() {
  const listEl = document.getElementById('trips-history-list');
  if (!listEl) return;

  const trips = SettingsManager.getTrips();
  if (trips.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs">
        Nenhuma corrida registrada ainda.<br>Faça simulações na Calculadora ou no Simulador de Overlay!
      </div>
    `;
    return;
  }

  listEl.innerHTML = trips.slice(0, 20).map(t => {
    const isAccepted = t.status === 'ACCEPTED';
    const isRejected = t.status === 'REJECTED';
    const badgeColor = isAccepted ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : isRejected ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    const statusText = isAccepted ? 'Aceita' : isRejected ? 'Recusada' : 'Simulada';

    return `
      <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-white">${t.app || 'Corrida'}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}">${statusText}</span>
          </div>
          <div class="text-[11px] text-slate-400 mt-1">
            ${t.totalKm?.toFixed(1) || 0} km • ${t.timeMinutes || 0} min • R$ ${t.grossPerKm?.toFixed(2) || 0}/km
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm font-extrabold text-white">R$ ${t.price?.toFixed(2) || '0.00'}</div>
          <div class="text-[11px] font-mono text-emerald-400">+R$ ${t.netProfit?.toFixed(2) || '0.00'} liq.</div>
        </div>
      </div>
    `;
  }).join('');
}

function updateDashboardStats() {
  const trips = SettingsManager.getTrips();
  const acceptedTrips = trips.filter(t => t.status === 'ACCEPTED' || t.status === 'SIMULATED');

  const totalGross = acceptedTrips.reduce((acc, t) => acc + (t.price || 0), 0);
  const totalNet = acceptedTrips.reduce((acc, t) => acc + (t.netProfit || 0), 0);
  const totalKm = acceptedTrips.reduce((acc, t) => acc + (t.totalKm || 0), 0);

  document.querySelectorAll('.stat-total-gross').forEach(el => el.textContent = `R$ ${totalGross.toFixed(2)}`);
  document.querySelectorAll('.stat-total-net').forEach(el => el.textContent = `R$ ${totalNet.toFixed(2)}`);
  document.querySelectorAll('.stat-total-km').forEach(el => el.textContent = `${totalKm.toFixed(1)} km`);
  document.querySelectorAll('.stat-trips-count').forEach(el => el.textContent = `${trips.length}`);
}

function setupSettingsForm() {
  // Preencher inputs com as configurações atuais
  const appNameInp = document.getElementById('cfg-app-name');
  const taglineInp = document.getElementById('cfg-tagline');
  const driverNameInp = document.getElementById('cfg-driver-name');
  const brandColorInp = document.getElementById('cfg-brand-color');
  const fuelPriceInp = document.getElementById('cfg-fuel-price');
  const consumptionInp = document.getElementById('cfg-consumption');
  const maintenanceInp = document.getElementById('cfg-maintenance');
  const minKmInp = document.getElementById('cfg-min-km');
  const minHourInp = document.getElementById('cfg-min-hour');
  const maxPickupInp = document.getElementById('cfg-max-pickup');

  if (appNameInp) appNameInp.value = settings.appName;
  if (taglineInp) taglineInp.value = settings.tagline || '';
  if (driverNameInp) driverNameInp.value = settings.driverName || '';
  if (brandColorInp) brandColorInp.value = settings.brandColor;
  if (fuelPriceInp) fuelPriceInp.value = settings.fuelPrice;
  if (consumptionInp) consumptionInp.value = settings.consumptionKmPerL;
  if (maintenanceInp) maintenanceInp.value = settings.maintenancePerKm;
  if (minKmInp) minKmInp.value = settings.minGrossPerKm;
  if (minHourInp) minHourInp.value = settings.minGrossPerHour;
  if (maxPickupInp) maxPickupInp.value = settings.maxPickupKm;

  document.getElementById('form-settings')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const newSettings = {
      ...settings,
      appName: appNameInp.value || 'Mario Driver Pro',
      tagline: taglineInp.value || 'Drive Smart, Earn More',
      driverName: driverNameInp.value || 'Motorista Parceiro',
      brandColor: brandColorInp.value || '#ff7024',
      fuelPrice: parseFloat(fuelPriceInp.value) || 5.89,
      consumptionKmPerL: parseFloat(consumptionInp.value) || 11.5,
      maintenancePerKm: parseFloat(maintenanceInp.value) || 0.22,
      minGrossPerKm: parseFloat(minKmInp.value) || 2.30,
      minGrossPerHour: parseFloat(minHourInp.value) || 38.0,
      maxPickupKm: parseFloat(maxPickupInp.value) || 3.5
    };

    SettingsManager.saveSettings(newSettings);
    settings = newSettings;
    calculator.updateConfig(settings);
    applyBranding(settings);

    alert('Configurações e Customizações salvas com sucesso!');
  });

  // Limpar histórico
  document.getElementById('btn-clear-history')?.addEventListener('click', () => {
    if (confirm('Deseja realmente limpar todo o histórico de viagens gravadas?')) {
      SettingsManager.clearTrips();
      renderTripHistory();
      updateDashboardStats();
    }
  });

  // Restaurar padrões
  document.getElementById('btn-reset-defaults')?.addEventListener('click', () => {
    if (confirm('Restaurar configurações padrão do Mario?')) {
      SettingsManager.saveSettings(DEFAULT_SETTINGS);
      settings = DEFAULT_SETTINGS;
      calculator.updateConfig(settings);
      location.reload();
    }
  });
}
