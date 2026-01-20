# 📋 Estrutura de Horários para Firebase

## Como adicionar horários ao restaurante no Firebase

### Caminho no Firebase:
```
restaurantes/
  └── {restaurantId}/
      └── horarios/
```

---

## ✅ Exemplo completo de estrutura:

```json
{
  "restaurantes": {
    "restaurante-123": {
      "nome": "Burger King",
      "categoria": "Hamburguer",
      "cidade": "Pelotas",
      "telefone": "(53) 99999-9999",
      "endereco": "Rua das Flores, 123",
      "imagem": "https://...",
      "avaliacao": 4.5,
      "tempoEntrega": "30-40 min",
      
      "horarios": {
        "domingo": {
          "abertura": "11:00",
          "fechamento": "22:00"
        },
        "segunda": {
          "abertura": "10:00",
          "fechamento": "23:00"
        },
        "terca": {
          "abertura": "10:00",
          "fechamento": "23:00"
        },
        "quarta": {
          "abertura": "10:00",
          "fechamento": "23:00"
        },
        "quinta": {
          "abertura": "10:00",
          "fechamento": "23:00"
        },
        "sexta": {
          "abertura": "10:00",
          "fechamento": "00:00"
        },
        "sabado": {
          "abertura": "11:00",
          "fechamento": "00:00"
        }
      }
    }
  }
}
```

---

## 🚫 Exemplo de restaurante fechado em um dia:

```json
{
  "horarios": {
    "domingo": {
      "fechado": true
    },
    "segunda": {
      "abertura": "11:00",
      "fechamento": "22:00"
    },
    "terca": {
      "abertura": "11:00",
      "fechamento": "22:00"
    },
    "quarta": {
      "abertura": "11:00",
      "fechamento": "22:00"
    },
    "quinta": {
      "abertura": "11:00",
      "fechamento": "22:00"
    },
    "sexta": {
      "abertura": "11:00",
      "fechamento": "23:00"
    },
    "sabado": {
      "abertura": "12:00",
      "fechamento": "23:00"
    }
  }
}
```

---

## 📱 Exemplos de status que serão exibidos:

### ✅ Restaurante aberto:
- **"Aberto • Aberto até 23:00"** (se faltar mais de 30 minutos)
- **"Aberto • Fecha em 15 min"** (se faltar menos de 30 minutos)

### ❌ Restaurante fechado:
- **"Fechado • Abre hoje às 11:00"** (se ainda não abriu hoje)
- **"Fechado • Abre amanhã às 10:00"** (se já fechou hoje)
- **"Fechado • Abre segunda às 10:00"** (se fechado hoje e amanhã)

---

## ⏰ Como funciona:

1. **Atualização automática:** O status é verificado a cada 1 minuto
2. **Cálculo dinâmico:** Considera o dia da semana e hora atual
3. **Próximo horário:** Mostra quando o restaurante abrirá novamente
4. **Fechamento próximo:** Avisa quando falta menos de 30 minutos

---

## 🔧 Campos obrigatórios:

- `abertura`: Horário de abertura no formato "HH:MM" (ex: "10:00")
- `fechamento`: Horário de fechamento no formato "HH:MM" (ex: "23:00")
- `fechado`: (opcional) `true` se o restaurante não abre neste dia

---

## 📝 Dias da semana aceitos:

- `domingo`
- `segunda`
- `terca` (sem cedilha!)
- `quarta`
- `quinta`
- `sexta`
- `sabado`

---

## ⚠️ IMPORTANTE:

- Use **"terca"** e **"sabado"** sem acentos/cedilha
- Horário deve ser sempre no formato **24 horas** (ex: "14:00", não "2:00 PM")
- Se um dia não tiver horário definido, será considerado **fechado**
