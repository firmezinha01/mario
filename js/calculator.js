/**
 * Motor de Cálculo de Rentabilidade do Motorista
 * Baseado no modelo de cálculo inteligente do Mario
 */

export class RideCalculator {
  constructor(config = {}) {
    this.config = {
      fuelPrice: config.fuelPrice ?? 5.89,          // R$ por litro de combustível
      consumptionKmPerL: config.consumptionKmPerL ?? 11.5, // Km por litro
      maintenancePerKm: config.maintenancePerKm ?? 0.22,   // Custo desgaste/pneu/óleo por km
      minGrossPerKm: config.minGrossPerKm ?? 2.30,        // Meta mínima bruta por km
      minGrossPerHour: config.minGrossPerHour ?? 38.0,     // Meta mínima bruta por hora
      maxPickupKm: config.maxPickupKm ?? 3.5,              // Distância máx até o passageiro
      ...config
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  calculate({ price, pickupKm = 0, tripKm = 0, timeMinutes = 1 }) {
    const totalKm = Math.max(0.1, Number(pickupKm) + Number(tripKm));
    const totalMinutes = Math.max(1, Number(timeMinutes));
    const farePrice = Math.max(0, Number(price));

    // 1. Ganhos Brutos
    const grossPerKm = farePrice / totalKm;
    const grossPerHour = (farePrice / totalMinutes) * 60;

    // 2. Custos Estimados
    const fuelCost = (totalKm / this.config.consumptionKmPerL) * this.config.fuelPrice;
    const maintenanceCost = totalKm * this.config.maintenancePerKm;
    const totalCost = fuelCost + maintenanceCost;

    // 3. Lucro Líquido Real (no bolso do motorista)
    const netProfit = farePrice - totalCost;
    const netPerKm = netProfit / totalKm;
    const netPerHour = (netProfit / totalMinutes) * 60;
    const marginPercent = farePrice > 0 ? (netProfit / farePrice) * 100 : 0;

    // 4. Critérios de Avaliação (Veredito Mario)
    let verdict = 'BAD'; // 'GOOD' | 'MEDIUM' | 'BAD'
    let reasons = [];

    const isGoodKm = grossPerKm >= this.config.minGrossPerKm;
    const isMediumKm = grossPerKm >= this.config.minGrossPerKm * 0.85;
    const isGoodHour = grossPerHour >= this.config.minGrossPerHour;
    const isGoodPickup = pickupKm <= this.config.maxPickupKm;

    if (!isGoodPickup) {
      reasons.push(`Embarque longe (${pickupKm.toFixed(1)} km)`);
    }

    if (isGoodKm && isGoodHour && isGoodPickup) {
      verdict = 'GOOD';
      reasons.push('Excelente rentabilidade por km e tempo!');
    } else if ((isGoodKm || isGoodHour) && isMediumKm) {
      verdict = 'MEDIUM';
      reasons.push('Rentabilidade aceitável, avalie a região de destino.');
    } else {
      verdict = 'BAD';
      if (!isMediumKm) reasons.push(`Paga pouco por km (R$ ${grossPerKm.toFixed(2)}/km)`);
      if (!isGoodHour) reasons.push(`Média por hora baixa (R$ ${grossPerHour.toFixed(2)}/h)`);
    }

    return {
      price: farePrice,
      pickupKm,
      tripKm,
      totalKm,
      timeMinutes: totalMinutes,
      grossPerKm,
      grossPerHour,
      fuelCost,
      maintenanceCost,
      totalCost,
      netProfit,
      netPerKm,
      netPerHour,
      marginPercent,
      verdict,
      reasons,
      badge: this.getVerdictBadge(verdict)
    };
  }

  getVerdictBadge(verdict) {
    switch (verdict) {
      case 'GOOD':
        return {
          text: 'CORRIDA TOP (ACEITAR)',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '#10b981',
          icon: 'check-circle'
        };
      case 'MEDIUM':
        return {
          text: 'REGULAR (AVALIAR)',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '#f59e0b',
          icon: 'alert-triangle'
        };
      case 'BAD':
      default:
        return {
          text: 'PREJUÍZO (RECUSAR)',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#ef4444',
          icon: 'x-circle'
        };
    }
  }
}
