import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Separator } from '@/app/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { CreditCard, MapPin, Phone, User, Check, Loader2, MessageSquare } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, push, set, get, runTransaction } from 'firebase/database';
import { AlertDialog } from '@/app/components/AlertDialog';
import type { MenuItemType } from './MenuItem';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPrice: number;
  onConfirmOrder: (orderData: OrderData) => void;
  cartItems?: Array<{ item: MenuItemType; quantity: number }>;
  restaurantId?: string;
  restaurantName?: string;
  instrucoesPreparo?: string;  // ✅ Novo
  setInstrucoesPreparo?: (value: string) => void;  // ✅ Novo
}

export interface OrderData {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  instructions?: string;  // ✅ Campo opcional para observações
}

export function CheckoutDialog({ open, onOpenChange, totalPrice, onConfirmOrder, cartItems = [], restaurantId = '', restaurantName = '', instrucoesPreparo = '', setInstrucoesPreparo = () => {} }: CheckoutDialogProps) {
  const [step, setStep] = useState<'login' | 'details' | 'success'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Estados para AlertDialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('warning');
  
  const [formData, setFormData] = useState<OrderData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'pix',
    instructions: '',  // ✅ Novo campo
  });

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('Credencial não recebida');
      }

      // Decodificar o JWT token do Google para extrair dados do usuário
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const userData = JSON.parse(jsonPayload);
      console.log('Dados do usuário do Google:', userData);
      
      // ✅ Preencher APENAS nome e email do Google
      // Telefone, endereço e forma de pagamento serão preenchidos pelo cliente
      setFormData({
        ...formData,
        name: userData.name || '',       // ✅ Do Google
        email: userData.email || '',     // ✅ Do Google
        // phone: '',                     // ❌ Cliente preenche
        // address: '',                   // ❌ Cliente preenche
        // paymentMethod: 'pix'           // ❌ Cliente escolhe
      });
      setStep('details');
    } catch (error: any) {
      console.error('Erro no login do Google:', error);
      alert('Erro ao fazer login com Google. Tente novamente ou continue sem login.');
    }
  };

  // ✅ Função para garantir que o telefone tenha o código do país (55)
  const formatarTelefoneComCodigoPais = (telefone: string): string => {
    // Remover todos os caracteres não numéricos
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    // Verificar se já começa com 55
    if (apenasNumeros.startsWith('55')) {
      console.log('✅ Telefone já tem código do país:', apenasNumeros);
      return apenasNumeros;
    }
    
    // Adicionar 55 no início
    const telefoneCompleto = '55' + apenasNumeros;
    console.log('📞 Código do país adicionado:', apenasNumeros, '→', telefoneCompleto);
    return telefoneCompleto;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const timestamp = Date.now();
      const numeroPedido = Math.floor(Math.random() * 9000000) + 1000000;
      
      // ✅ Formatar telefone com código do país
      const telefoneFormatado = formatarTelefoneComCodigoPais(formData.phone);
      
      console.log('🚀 ========== INÍCIO DO PROCESSO DE PEDIDO ==========');
      console.log('📋 Restaurant ID:', restaurantId);
      console.log('📋 Restaurant Name:', restaurantName);
      console.log('📋 Total Price:', totalPrice);
      console.log('📋 Cart Items:', cartItems);
      console.log('📋 Form Data:', formData);
      console.log('📞 Telefone original:', formData.phone);
      console.log('📞 Telefone formatado:', telefoneFormatado);
      
      // 1. VERIFICAR ESTOQUE ANTES DE PROCESSAR O PEDIDO
      console.log('🔍 Verificando estoque...');
      
      // Verificar disponibilidade de cada item
      const itensIndisponiveis: string[] = [];
      
      for (const { item, quantity } of cartItems) {
        // Ler do caminho correto: dados/{restaurantId}/estoque/itens/{itemId}
        const caminhoEstoque = `dados/${restaurantId}/estoque/itens/${item.id}`;
        console.log(`🔍 Verificando item: ${item.name}`);
        console.log(`📂 Caminho: ${caminhoEstoque}`);
        
        const itemEstoqueRef = ref(database, caminhoEstoque);
        const itemSnapshot = await get(itemEstoqueRef);
        
        console.log(`📦 Snapshot existe?`, itemSnapshot.exists());
        
        if (!itemSnapshot.exists()) {
          console.log(`❌ Item não encontrado no estoque: ${item.id}`);
          itensIndisponiveis.push(
            `${item.name} (item não encontrado no estoque)`
          );
          continue;
        }
        
        const itemEstoque = itemSnapshot.val();
        console.log(`📦 Dados do estoque:`, itemEstoque);
        
        const quantidadeDisponivel = itemEstoque.quantidade || 0;
        
        console.log(`📦 ${item.name}: quantidade disponível = ${quantidadeDisponivel}, solicitado = ${quantity}`);
        
        if (quantidadeDisponivel < quantity) {
          itensIndisponiveis.push(
            `${item.name} (disponível: ${quantidadeDisponivel}, solicitado: ${quantity})`
          );
        }
      }

      // Se houver itens indisponíveis, cancelar o pedido
      if (itensIndisponiveis.length > 0) {
        setAlertTitle('Estoque insuficiente');
        setAlertMessage(`Desculpe, temos apenas ${itensIndisponiveis.length === 1 ? 'o seguinte item' : 'os seguintes itens'} com estoque limitado:\n\n${itensIndisponiveis.join('\n')}\n\nPor favor, ajuste as quantidades no carrinho.`);
        setAlertType('warning');
        setAlertOpen(true);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Estoque verificado, processando pedido...');
      
      // 2. ESTRUTURA DO PEDIDO (seguindo padrão exato do Firebase)
      const novoPedido = {
        atualizadoEm: timestamp,
        cliente: formData.name,
        criadoEm: timestamp,
        endereco: formData.address,
        formaPagamento: formData.paymentMethod === 'pix' ? 'pix' : 
                       formData.paymentMethod === 'credit' ? 'credito' :
                       formData.paymentMethod === 'debit' ? 'debito' : 'dinheiro',
        instrucoes: instrucoesPreparo || '',  // ✅ Instruções de preparo
        itens: cartItems.reduce((acc, { item, quantity }, index) => {
          acc[index] = {
            id: item.id,
            nome: item.name,
            preco: item.price,
            quantidade: quantity
          };
          return acc;
        }, {} as Record<number, { id: string; nome: string; preco: number; quantidade: number }>),
        numero: numeroPedido.toString().padStart(9, '0'), // ✅ Formato: "000000005"
        status: 'preparando',
        telefone: telefoneFormatado,  // ✅ Usar telefone formatado
        tipo: 'delivery',
        total: totalPrice + 5
      };

      console.log('📦 Estrutura do pedido criada:', novoPedido);
      console.log('👨‍🍳 Instruções de preparo:', instrucoesPreparo);

      // 3. REGISTRAR PEDIDO no Firebase usando POST
      console.log('💾 Salvando pedido no Firebase usando POST...');
      const urlPedido = `https://appfood-e25bb-default-rtdb.firebaseio.com/dados/${restaurantId}/pedidos.json`;
      console.log('📂 URL do pedido:', urlPedido);
      
      try {
        const responsePedido = await fetch(urlPedido, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoPedido)
        });

        if (!responsePedido.ok) {
          throw new Error(`Erro HTTP: ${responsePedido.status} - ${responsePedido.statusText}`);
        }

        const resultPedido = await responsePedido.json();
        console.log('✅ Pedido salvo com sucesso via POST:', resultPedido);
        console.log('🔑 ID do pedido:', resultPedido.name);
      } catch (errorPedido) {
        console.error('❌ ERRO ao salvar pedido via POST:', errorPedido);
        console.error('❌ Detalhes do erro:', JSON.stringify(errorPedido, null, 2));
        throw new Error(`Falha ao salvar pedido: ${(errorPedido as Error).message}`);
      }

      // 4. SALVAR EM LEADS-SITE usando POST
      console.log('💾 Salvando lead usando POST...');
      const urlLead = 'https://appfood-e25bb-default-rtdb.firebaseio.com/Leads-site.json';
      const leadData = {
        pedidoNumero: numeroPedido.toString().padStart(9, '0'),
        restaurante: restaurantName,
        restauranteId: restaurantId,
        cliente: formData.name,
        email: formData.email,
        telefone: telefoneFormatado,  // ✅ Usar telefone formatado
        endereco: formData.address,
        formaPagamento: formData.paymentMethod === 'pix' ? 'PIX' : 
                       formData.paymentMethod === 'credit' ? 'Crédito' :
                       formData.paymentMethod === 'debit' ? 'Débito' : 'Dinheiro',
        itens: cartItems.map(({ item, quantity }) => `${quantity}x ${item.name}`).join(', '),
        total: totalPrice + 5,
        data: new Date().toISOString(),
        notificadoCliente: false  // ✅ Novo campo
      };
      
      console.log('📦 Lead data:', leadData);
      
      try {
        const responseLead = await fetch(urlLead, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData)
        });

        if (!responseLead.ok) {
          console.warn(`⚠️ Aviso: Erro ao salvar lead: ${responseLead.status}`);
        } else {
          const resultLead = await responseLead.json();
          console.log('✅ Lead salvo via POST:', resultLead);
        }
      } catch (errorLead) {
        console.error('❌ ERRO ao salvar lead via POST:', errorLead);
        // Não vamos parar o processo se o lead falhar
      }

      // 5. BAIXAR ESTOQUE
      console.log('📉 Baixando estoque...');
      
      const promessasBaixa = cartItems.map(async ({ item, quantity }) => {
        const itemEstoqueRef = ref(database, `dados/${restaurantId}/estoque/itens/${item.id}/quantidade`);
        
        await runTransaction(itemEstoqueRef, (qtdAtual) => {
          const novaQtd = (qtdAtual || 0) - quantity;
          console.log(`  📦 ${item.name}: ${qtdAtual} → ${novaQtd}`);
          return novaQtd;
        });
      });

      await Promise.all(promessasBaixa);
      console.log('✅ Estoque atualizado com sucesso!');
      
      console.log('🎉 ========== PEDIDO FINALIZADO COM SUCESSO ==========');
      
      onConfirmOrder(formData);
      setStep('success');
    } catch (error) {
      console.error('❌ ========== ERRO NO PROCESSO ==========');
      console.error('❌ Erro completo:', error);
      console.error('❌ Stack trace:', (error as Error).stack);
      setAlertTitle('Erro ao processar pedido');
      setAlertMessage(`Ocorreu um erro ao processar seu pedido:\n\n${(error as Error).message}\n\nPor favor, tente novamente.`);
      setAlertType('error');
      setAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('login');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'pix',
        instructions: '',  // ✅ Novo campo
      });
    }, 300);
  };

  return (
    <>
      <AlertDialog 
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
      
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold">
              {step === 'login' && 'Fazer Login'}
              {step === 'details' && 'Finalizar Pedido'}
              {step === 'success' && 'Pedido Confirmado!'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {step === 'login' && 'Entre com sua conta para continuar'}
              {step === 'details' && 'Preencha seus dados para entrega'}
              {step === 'success' && 'Seu pedido foi realizado com sucesso'}
            </DialogDescription>
          </DialogHeader>

          {step === 'login' && (
            <div className="space-y-3 py-3">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => console.log('Login Failed')}
                  size="large"
                  text="continue_with"
                  width="350"
                />
              </div>
              
              <p className="text-xs text-center text-gray-500">
                Faça login com sua conta Google para continuar
              </p>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-3 py-2">
              <div>
                <Label htmlFor="name" className="text-xs">Nome completo</Label>
                <div className="relative mt-0.5">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-8 h-9 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs">E-mail</Label>
                <div className="relative mt-0.5">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Seu e-mail"
                    className="pl-8 h-9 text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs">Telefone (com DDD)</Label>
                <div className="relative mt-0.5">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="91999999999"
                    className="pl-8 h-9 text-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 ml-1">
                  Digite com DDD (ex: 91999999999)
                </p>
              </div>

              <div>
                <Label htmlFor="address" className="text-xs">Endereço de entrega</Label>
                <div className="relative mt-0.5">
                  <MapPin className="absolute left-2.5 top-2.5 size-3.5 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Rua, número, bairro"
                    className="pl-8 h-9 text-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions" className="text-xs">Instruções (opcional)</Label>
                <div className="relative mt-0.5">
                  <MessageSquare className="absolute left-2.5 top-2.5 size-3.5 text-gray-400" />
                  <Textarea
                    id="instructions"
                    placeholder="Ex: Apto 302..."
                    className="pl-8 min-h-14 text-sm"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <Label className="flex items-center gap-1.5 mb-1.5 text-xs">
                  <CreditCard className="size-3.5" />
                  Forma de pagamento
                </Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  className="grid grid-cols-2 gap-1.5"
                >
                  <label
                    htmlFor="pix"
                    className={`flex flex-col items-center gap-1 border-2 rounded-md p-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'pix'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <RadioGroupItem value="pix" id="pix" className="shrink-0" />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-[11px]">PIX</div>
                    </div>
                  </label>

                  <label
                    htmlFor="credit"
                    className={`flex flex-col items-center gap-1 border-2 rounded-md p-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'credit'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <RadioGroupItem value="credit" id="credit" className="shrink-0" />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-[11px]">Crédito</div>
                    </div>
                  </label>

                  <label
                    htmlFor="debit"
                    className={`flex flex-col items-center gap-1 border-2 rounded-md p-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'debit'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <RadioGroupItem value="debit" id="debit" className="shrink-0" />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-[11px]">Débito</div>
                    </div>
                  </label>

                  <label
                    htmlFor="cash"
                    className={`flex flex-col items-center gap-1 border-2 rounded-md p-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'cash'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <RadioGroupItem value="cash" id="cash" className="shrink-0" />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-[11px]">Dinheiro</div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1.5 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Taxa de entrega</span>
                  <span className="font-medium">R$ 5,00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {(totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="size-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Pedido Confirmado!</h3>
              <p className="text-gray-600">
                Seu pedido foi enviado para o restaurante e está sendo preparado.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor total</span>
                  <span className="font-semibold">R$ {(totalPrice + 5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pagamento</span>
                  <span className="font-semibold capitalize">
                    {formData.paymentMethod === 'pix' && 'PIX'}
                    {formData.paymentMethod === 'credit' && 'Cartão de Crédito'}
                    {formData.paymentMethod === 'debit' && 'Cartão de Débito'}
                    {formData.paymentMethod === 'cash' && 'Dinheiro'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entrega em</span>
                  <span className="font-semibold">30-40 min</span>
                </div>
              </div>
              <Button
                onClick={handleClose}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}