/**
 * Gerenciamento de Configurações, Customizações e Histórico de Viagens
 */

const STORAGE_KEY_SETTINGS = 'mario_custom_settings';
const STORAGE_KEY_TRIPS = 'mario_custom_trips';

export const DEFAULT_SETTINGS = {
  appName: 'Mario Driver Pro',
  tagline: 'Base Inteligente Mario',
  brandColor: '#ff7024',
  driverName: 'Motorista Parceiro',
  vehicleType: 'car', // 'car' | 'moto'
  fuelPrice: 5.89,
  consumptionKmPerL: 11.5,
  maintenancePerKm: 0.22,
  minGrossPerKm: 2.30,
  minGrossPerHour: 38.00,
  maxPickupKm: 3.5,
  soundAlert: true,
  autoRejectBadTrips: true,
  supportedApps: {
    uber: true,
    uberMoto: true,
    noventaEnove: true,
    indrive: true
  }
};

export class SettingsManager {
  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Erro ao ler settings do localStorage, usando padrões', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      this.applyTheme(settings);
      return true;
    } catch (e) {
      console.error('Erro ao salvar settings', e);
      return false;
    }
  }

  static applyTheme(settings) {
    const root = document.documentElement;
    if (settings.brandColor) {
      root.style.setProperty('--primary-color', settings.brandColor);
    }
  }

  static getTrips() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TRIPS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveTrip(trip) {
    const trips = this.getTrips();
    const newTrip = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...trip
    };
    trips.unshift(newTrip); // mais recente primeiro
    // Guarda até 100 corridas
    if (trips.length > 100) trips.pop();
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
    return newTrip;
  }

  static clearTrips() {
    localStorage.removeItem(STORAGE_KEY_TRIPS);
  }

  static playAlertSound(type = 'good') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'good') {
        // Som alegre de aprovação (dois bipes ascendentes)
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Som grave de alerta / recusa
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Áudio não suportado ou bloqueado pelo navegador');
    }
  }
}
