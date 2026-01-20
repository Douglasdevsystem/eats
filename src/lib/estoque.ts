import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

/**
 * Repõe o estoque quando um pedido é cancelado
 * @param restaurantId - ID do restaurante
 * @param itensDetalhados - Array de itens com itemId e quantidade
 */
export async function reporEstoque(
  restaurantId: string, 
  itensDetalhados: Array<{ itemId: string; quantidade: number; nome: string }>
) {
  try {
    console.log('🔄 REPONDO ESTOQUE...');
    console.log('📋 Restaurant ID:', restaurantId);
    console.log('📦 Itens a repor:', itensDetalhados);

    for (const item of itensDetalhados) {
      if (!item.itemId) {
        console.warn(`⚠️ Item sem itemId, pulando: ${item.nome}`);
        continue;
      }

      const itemEstoqueRef = ref(
        database, 
        `dados/${restaurantId}/estoque/itens/${item.itemId}`
      );
      
      const itemSnapshot = await get(itemEstoqueRef);
      
      if (!itemSnapshot.exists()) {
        console.warn(`⚠️ Item não encontrado no estoque: ${item.itemId}`);
        continue;
      }
      
      const itemEstoque = itemSnapshot.val();
      const quantidadeAtual = itemEstoque.quantidade || 0;
      const novaQuantidade = quantidadeAtual + item.quantidade;
      
      await update(itemEstoqueRef, {
        quantidade: novaQuantidade
      });
      
      console.log(`  ✅ ${item.nome}: ${quantidadeAtual} → ${novaQuantidade} (+${item.quantidade})`);
    }
    
    console.log('✅ Estoque reposto com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao repor estoque:', error);
    return { success: false, error };
  }
}
