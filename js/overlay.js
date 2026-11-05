/**
 * Simulador do Overlay Flutuante do Mario
 * Mostra como a bolha flutuante reage e calcula por cima do app de motorista
 */

import { SettingsManager } from './settings.js';

export const SAMPLE_RIDES = [
  {
    app: 'UberX',
    icon: 'assets/images/app_uber_light.webp',
    passenger: 'Carlos S. ★ 4.92',
    origin: 'Av. Paulista, 1000 - Bela Vista',
    destination: 'Aeroporto de Congonhas',
    price: 34.50,
    pickupKm: 1.2,
    tripKm: 9.8,
    timeMinutes: 24,
    note: 'Corrida com dinâmica leve no horário'
  },
  {
    app: '99Pop',
    icon: 'assets/images/logo_circle.png',
    passenger: 'Mariana R. ★ 4.88',
    origin: 'Rua Augusta, 450 - Consolação',
    destination: 'Shopping Eldorado - Pinheiros',
    price: 18.20,
    pickupKm: 0.8,
    tripKm: 4.6,
    timeMinutes: 14,
    note: 'Curta distância com bom fluxo'
  },
  {
    app: 'UberX (Furada)',
    icon: 'assets/images/app_uber_dark.webp',
    passenger: 'Usuário Novo ★ 4.65',
    origin: 'Terminal Rodoviário',
    destination: 'Zona Leste Periférica',
    price: 14.80,
    pickupKm: 4.5,
    tripKm: 8.2,
    timeMinutes: 32,
    note: 'Embarque distante, trânsito pesado e retorno vazio'
  },
  {
    app: 'Uber Moto',
    icon: 'assets/images/app_uber_light.webp',
    passenger: 'Lucas M. ★ 4.95',
    origin: 'Metrô Santa Cruz',
    destination: 'Vila Mariana',
    price: 11.50,
    pickupKm: 0.5,
    tripKm: 2.8,
    timeMinutes: 8,
    note: 'Rápida e alta rentabilidade por hora'
  }
];

export class OverlaySimulator {
  constructor(calculator, onRideAction) {
    this.calculator = calculator;
    this.onRideAction = onRideAction;
    this.activeRide = null;
  }

  showRide(rideData) {
    this.activeRide = rideData;
    const result = this.calculator.calculate(rideData);

    const overlayContainer = document.getElementById('floating-overlay-target');
    if (!overlayContainer) return;

    // Tocar som de alerta baseado no veredito
    SettingsManager.playAlertSound(result.verdict === 'GOOD' ? 'good' : 'bad');

    overlayContainer.innerHTML = `
      <div class="floating-overlay-card bg-slate-900/95 border text-white rounded-2xl p-4 shadow-2xl relative w-full max-w-sm mx-auto overflow-hidden">
        <!-- Barra de Progresso / Tempo de Aceite -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-slate-700">
          <div id="ride-timer-bar" class="h-full bg-orange-500 w-full transition-all duration-1000 ease-linear"></div>
        </div>

        <!-- Cabeçalho do Card -->
        <div class="flex items-center justify-between mt-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 text-xs font-bold rounded-lg ${rideData.app.includes('99') ? 'bg-yellow-500 text-black' : 'bg-black text-white border border-slate-700'}">
              ${rideData.app}
            </span>
            <span class="text-xs text-slate-400 font-medium">${rideData.passenger}</span>
          </div>
          <div class="text-right">
            <span class="text-2xl font-black text-white">R$ ${rideData.price.toFixed(2)}</span>
          </div>
        </div>

        <!-- Veredito Mario -->
        <div class="mb-3 px-3 py-2 rounded-xl flex items-center justify-between" style="background-color: ${result.badge.bg}; border: 1px solid ${result.badge.border};">
          <div class="flex items-center gap-2">
            <span class="font-black text-sm" style="color: ${result.badge.color};">
              ${result.badge.text}
            </span>
          </div>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background: ${result.badge.color}; color: #000;">
            R$ ${result.grossPerKm.toFixed(2)}/km
          </span>
        </div>

        <!-- Detalhes da Corrida em Grid -->
        <div class="grid grid-cols-3 gap-2 text-center bg-slate-800/80 rounded-xl p-2.5 mb-3 border border-slate-700/60">
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Km Total</div>
            <div class="text-sm font-bold text-slate-100">${result.totalKm.toFixed(1)} km</div>
            <div class="text-[10px] text-slate-500">(${rideData.pickupKm} + ${rideData.tripKm})</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Tempo</div>
            <div class="text-sm font-bold text-slate-100">${result.timeMinutes} min</div>
            <div class="text-[10px] text-slate-400">R$ ${result.grossPerHour.toFixed(0)}/h</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Lucro Real</div>
            <div class="text-sm font-bold text-emerald-400 font-mono">R$ ${result.netProfit.toFixed(2)}</div>
            <div class="text-[10px] text-slate-500">custo R$ ${result.totalCost.toFixed(1)}</div>
          </div>
        </div>

        <!-- Origem e Destino -->
        <div class="space-y-1 text-xs mb-3 text-slate-300">
          <div class="flex items-center gap-1.5 truncate">
            <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span class="truncate">${rideData.origin}</span>
          </div>
          <div class="flex items-center gap-1.5 truncate">
            <span class="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></span>
            <span class="truncate font-semibold text-white">${rideData.destination}</span>
          </div>
        </div>

        <!-- Botões de Ação do Motorista -->
        <div class="flex gap-2">
          <button id="btn-reject-ride" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition active:scale-95">
            Recusar
          </button>
          <button id="btn-accept-ride" class="flex-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 transition active:scale-95">
            Aceitar Corrida
          </button>
        </div>
      </div>
    `;

    // Configurar listeners dos botões
    document.getElementById('btn-accept-ride')?.addEventListener('click', () => {
      this.closeOverlay();
      if (this.onRideAction) this.onRideAction('ACCEPT', rideData, result);
    });

    document.getElementById('btn-reject-ride')?.addEventListener('click', () => {
      this.closeOverlay();
      if (this.onRideAction) this.onRideAction('REJECT', rideData, result);
    });
  }

  closeOverlay() {
    const overlayContainer = document.getElementById('floating-overlay-target');
    if (overlayContainer) overlayContainer.innerHTML = '';
    this.activeRide = null;
  }
}
