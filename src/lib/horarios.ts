export interface HorarioFuncionamento {
  abertura?: string;
  fechamento?: string;
  inicio?: string;
  fim?: string;
  ativo?: boolean;
}

export interface Horarios {
  domingo?: HorarioFuncionamento;
  segunda?: HorarioFuncionamento;
  terca?: HorarioFuncionamento;
  quarta?: HorarioFuncionamento;
  quinta?: HorarioFuncionamento;
  sexta?: HorarioFuncionamento;
  sabado?: HorarioFuncionamento;
}

export function verificarRestauranteAberto(horarios: Horarios | null): {
  aberto: boolean;
  horarioFechamento: string;
  mensagem: string;
  horarioAbertura: string;
} {
  console.log('=== Verificando horários ===');
  console.log('Horários recebidos:', horarios);
  
  if (!horarios) {
    console.log('Sem horários configurados');
    return { aberto: false, horarioFechamento: '', mensagem: '', horarioAbertura: '' };
  }

  const now = new Date();
  const diaSemana = now.getDay(); // 0 = domingo, 1 = segunda, etc.
  const horaAtual = now.getHours();
  const minutoAtual = now.getMinutes();

  console.log('Data/Hora atual:', now.toLocaleString('pt-BR'));
  console.log('Dia da semana (número):', diaSemana);
  console.log('Hora atual:', `${horaAtual}:${minutoAtual.toString().padStart(2, '0')}`);

  const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const;
  const diaAtual = diasSemana[diaSemana];

  console.log('Dia atual (nome):', diaAtual);

  const horarioDia = horarios[diaAtual];
  console.log('Horário do dia:', horarioDia);

  if (!horarioDia || !horarioDia.ativo) {
    console.log('Restaurante fechado hoje ou não está ativo');
    // Procurar próximo dia que abre
    for (let i = 1; i <= 7; i++) {
      const proximoDiaIndex = (diaSemana + i) % 7;
      const proximoDia = diasSemana[proximoDiaIndex];
      const proximoHorario = horarios[proximoDia];
      
      const abertura = proximoHorario?.abertura || proximoHorario?.inicio;
      
      if (proximoHorario && proximoHorario.ativo && abertura) {
        const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][proximoDiaIndex];
        console.log(`Próximo dia de abertura: ${nomeDia} às ${abertura}`);
        if (i === 1) {
          return {
            aberto: false,
            horarioFechamento: '',
            mensagem: `Abre amanhã às ${abertura}`,
            horarioAbertura: abertura,
          };
        }
        return {
          aberto: false,
          horarioFechamento: '',
          mensagem: `Abre ${nomeDia} às ${abertura}`,
          horarioAbertura: abertura,
        };
      }
    }
    return { aberto: false, horarioFechamento: '', mensagem: 'Sem horário definido', horarioAbertura: '' };
  }

  // Converter horários do formato HH:MM para minutos
  const parseHorario = (horario: string): number => {
    const [hora, minuto] = horario.split(':').map(Number);
    return hora * 60 + minuto;
  };

  const minutosAtuais = horaAtual * 60 + minutoAtual;
  console.log('Minutos atuais desde meia-noite:', minutosAtuais);

  // Suportar tanto 'abertura/fechamento' quanto 'inicio/fim'
  const abertura = horarioDia.abertura || horarioDia.inicio;
  const fechamento = horarioDia.fechamento || horarioDia.fim;

  console.log('Abertura detectada:', abertura);
  console.log('Fechamento detectado:', fechamento);

  if (abertura && fechamento) {
    const minutosAbertura = parseHorario(abertura);
    const minutosFechamento = parseHorario(fechamento);

    console.log(`Abertura: ${abertura} (${minutosAbertura} minutos)`);
    console.log(`Fechamento: ${fechamento} (${minutosFechamento} minutos)`);

    if (minutosAtuais >= minutosAbertura && minutosAtuais < minutosFechamento) {
      console.log('✅ RESTAURANTE ABERTO');
      return {
        aberto: true,
        horarioFechamento: fechamento,
        mensagem: `Fecha às ${fechamento}`,
        horarioAbertura: '',
      };
    } else if (minutosAtuais < minutosAbertura) {
      console.log('❌ AINDA VAI ABRIR HOJE');
      return {
        aberto: false,
        horarioFechamento: '',
        mensagem: `Abre hoje às ${abertura}`,
        horarioAbertura: abertura,
      };
    } else {
      console.log('❌ JÁ FECHOU HOJE');
      // Já fechou hoje, procurar próximo dia que abre
      for (let i = 1; i <= 7; i++) {
        const proximoDiaIndex = (diaSemana + i) % 7;
        const proximoDia = diasSemana[proximoDiaIndex];
        const proximoHorario = horarios[proximoDia];
        
        const proximaAbertura = proximoHorario?.abertura || proximoHorario?.inicio;
        
        if (proximoHorario && proximoHorario.ativo && proximaAbertura) {
          const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][proximoDiaIndex];
          console.log(`Próximo dia de abertura: ${nomeDia} às ${proximaAbertura}`);
          if (i === 1) {
            return {
              aberto: false,
              horarioFechamento: '',
              mensagem: `Abre amanhã às ${proximaAbertura}`,
              horarioAbertura: proximaAbertura,
            };
          }
          return {
            aberto: false,
            horarioFechamento: '',
            mensagem: `Abre ${nomeDia} às ${proximaAbertura}`,
            horarioAbertura: proximaAbertura,
          };
        }
      }
      return { aberto: false, horarioFechamento: '', mensagem: 'Sem horário definido', horarioAbertura: '' };
    }
  }

  console.log('⚠️ Horário de abertura ou fechamento não definido');
  return { aberto: false, horarioFechamento: '', mensagem: 'Sem horário definido', horarioAbertura: '' };
}