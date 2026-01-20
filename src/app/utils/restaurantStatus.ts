import type { OpeningHours } from '@/app/components/RestaurantCard';

export interface RestaurantStatus {
  isOpen: boolean;
  statusText: string;
  nextOpenTime?: string;
}

/**
 * Calcula se o restaurante está aberto agora
 * @param horarios - Horários de funcionamento do restaurante
 * @returns Status atual do restaurante
 */
export function getRestaurantStatus(horarios?: OpeningHours): RestaurantStatus {
  if (!horarios) {
    return {
      isOpen: false,
      statusText: 'Horário não disponível',
    };
  }

  const now = new Date();
  const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const diaAtual = diasSemana[now.getDay()];
  const horaAtual = now.getHours();
  const minutoAtual = now.getMinutes();
  const tempoAtualEmMinutos = horaAtual * 60 + minutoAtual;

  // Verificar se o dia atual tem horário definido
  const horarioDia = horarios[diaAtual];
  
  if (!horarioDia || horarioDia.fechado) {
    // Restaurante fechado hoje, procurar próximo dia aberto
    return getNextOpenDay(horarios, diaAtual);
  }

  // Converter horários de abertura e fechamento para minutos
  const [horaAbertura, minutoAbertura] = horarioDia.abertura.split(':').map(Number);
  const [horaFechamento, minutoFechamento] = horarioDia.fechamento.split(':').map(Number);
  
  const aberturaEmMinutos = horaAbertura * 60 + minutoAbertura;
  const fechamentoEmMinutos = horaFechamento * 60 + minutoFechamento;

  // Verificar se está aberto agora
  if (tempoAtualEmMinutos >= aberturaEmMinutos && tempoAtualEmMinutos < fechamentoEmMinutos) {
    const minutosRestantes = fechamentoEmMinutos - tempoAtualEmMinutos;
    
    if (minutosRestantes <= 30) {
      return {
        isOpen: true,
        statusText: `Fecha em ${minutosRestantes} min`,
      };
    }
    
    return {
      isOpen: true,
      statusText: `Aberto até ${horarioDia.fechamento}`,
    };
  }

  // Restaurante fechado agora
  if (tempoAtualEmMinutos < aberturaEmMinutos) {
    // Ainda não abriu hoje
    return {
      isOpen: false,
      statusText: `Abre hoje às ${horarioDia.abertura}`,
      nextOpenTime: horarioDia.abertura,
    };
  }

  // Já fechou hoje, procurar próximo dia
  return getNextOpenDay(horarios, diaAtual);
}

/**
 * Encontra o próximo dia em que o restaurante abrirá
 */
function getNextOpenDay(horarios: OpeningHours, diaAtual: string): RestaurantStatus {
  const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const indiceDiaAtual = diasSemana.indexOf(diaAtual);
  
  // Procurar nos próximos 7 dias
  for (let i = 1; i <= 7; i++) {
    const proximoDiaIndex = (indiceDiaAtual + i) % 7;
    const proximoDia = diasSemana[proximoDiaIndex];
    const horarioDia = horarios[proximoDia];
    
    if (horarioDia && !horarioDia.fechado) {
      const nomeDia = getNomeDia(proximoDiaIndex, i);
      return {
        isOpen: false,
        statusText: `Abre ${nomeDia} às ${horarioDia.abertura}`,
        nextOpenTime: horarioDia.abertura,
      };
    }
  }

  return {
    isOpen: false,
    statusText: 'Fechado',
  };
}

/**
 * Retorna o nome do dia formatado
 */
function getNomeDia(diaIndex: number, diasAFrente: number): string {
  if (diasAFrente === 1) return 'amanhã';
  
  const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return nomes[diaIndex];
}
