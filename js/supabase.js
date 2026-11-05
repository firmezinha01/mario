/**
 * Cliente Supabase com Sincronização em Nuvem e Fallback para LocalStorage
 * Configure suas credenciais em supabase.com
 */

export const SUPABASE_CONFIG = {
  // Preencha com sua URL e anon key do Supabase:
  url: '',
  anonKey: ''
};

export class CloudSync {
  static isConfigured() {
    return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
  }

  static async syncTripToCloud(trip) {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          app_platform: trip.app || 'Desconhecido',
          passenger_info: trip.passenger || null,
          origin_address: trip.origin || null,
          destination_address: trip.destination || null,
          price: trip.price,
          pickup_km: trip.pickupKm || 0,
          trip_km: trip.tripKm || 0,
          total_km: trip.totalKm,
          time_minutes: trip.timeMinutes,
          gross_per_km: trip.grossPerKm,
          gross_per_hour: trip.grossPerHour,
          fuel_cost: trip.fuelCost,
          maintenance_cost: trip.maintenanceCost,
          total_cost: trip.totalCost,
          net_profit: trip.netProfit,
          verdict: trip.verdict,
          status: trip.status || 'SIMULATED'
        })
      });

      if (!response.ok) {
        console.warn('Erro ao sincronizar corrida no Supabase:', await response.text());
        return null;
      }

      return await response.json();
    } catch (e) {
      console.warn('Falha de rede ao conectar com Supabase:', e);
      return null;
    }
  }
}
