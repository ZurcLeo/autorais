# Configuração do Sistema de Validação PIX

Este documento explica como configurar e usar o novo sistema de validação de contas bancárias via micropagamento PIX.

## Configuração Necessária

### 1. Variáveis de Ambiente

Adicione a seguinte variável ao seu arquivo `.env`:

```env
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=your_mercado_pago_public_key_here
```

**Nota:** Esta chave é obrigatória para gerar o `deviceId` requerido pelo MercadoPago. Se não estiver disponível, o sistema usará um fallback.

### 2. Dependências

O sistema já inclui:
- MercadoPago SDK v2 (carregado via CDN no `public/index.html`)
- Componentes Material-UI adicionais para o formulário
- Utilitários para geração de device ID

## Como Funciona

### 1. Fluxo do Usuário

1. **Dados Pessoais**: O usuário preenche informações básicas (email, nome, documento)
2. **Geração do PIX**: Sistema gera QR Code e código PIX para micropagamento
3. **Confirmação**: Aguarda confirmação do pagamento e valida a conta

### 2. Campos Enviados ao Backend

O sistema agora envia todos os campos requeridos:

```javascript
{
  "amount": 1.00,
  "description": "Validação de Conta - ElosCloud",
  "email": "user@email.com",
  "firstName": "João",
  "lastName": "Silva", 
  "identificationType": "CPF",
  "identificationNumber": "12345678901",
  "deviceId": "DEVICE_ID_FROM_MERCADOPAGO_JS",
  "items": [{
    "id": "validation-account-id",
    "title": "Validação de Conta Bancária",
    "description": "Micropagamento para validação de conta bancária",
    "category_id": "services",
    "quantity": 1,
    "unit_price": 1.00
  }]
}
```

### 3. Device ID (OBRIGATÓRIO)

O `deviceId` é gerado seguindo **exatamente** as recomendações do backend:

```javascript
// Implementação conforme backend recomenda:
const mp = new MercadoPago('PUBLIC_KEY');
await mp.getIdentificationTypes(); // Gera device ID
const deviceId = mp.deviceId; // Agora disponível
```

**Fluxo implementado:**
- ✅ Aguarda carregamento do MercadoPago SDK (até 3 segundos)
- ✅ Inicializa com `REACT_APP_MERCADO_PAGO_PUBLIC_KEY`
- ✅ Chama `mp.getIdentificationTypes()` para gerar device ID
- ✅ Acessa `mp.deviceId` após a chamada
- ✅ Fallback robusto se SDK não estiver disponível
- ✅ Validação obrigatória antes de enviar ao backend

## Componentes Modificados

### 1. `src/components/Common/PixPayment.js`
- Adicionado formulário de dados pessoais
- Implementado stepper com 3 etapas
- Validação de campos obrigatórios
- Integração com utilitários do MercadoPago

### 2. `src/services/BankingService/index.js`
- Método `generateValidationPix` atualizado para enviar dados completos
- Integração com utilitários de device ID
- Melhor tratamento de erros

### 3. `src/providers/BankingProvider/index.js`
- Suporte para passar dados de pagamento
- Compatibilidade com nova assinatura do método

### 4. `src/utils/mercadoPagoUtils.js` (novo)
- Utilitários para geração de device ID
- Fallbacks robustos para quando SDK não está disponível
- Detecção e espera do carregamento do SDK

### 5. `public/index.html`
- Adicionado MercadoPago SDK V2

### 6. `src/utils/mercadoPagoValidation.js` (novo)
- Validação completa dos dados de pagamento
- Verificação de campos obrigatórios conforme MercadoPago
- Logs seguros para debugging
- Criação padronizada de dados de pagamento

### 7. `src/utils/__tests__/mercadoPagoIntegration.test.js` (novo)
- Testes e exemplos de uso
- Documentação da estrutura esperada
- Validação da conformidade com backend

## Uso

### Para Desenvolvedores

O componente `PixPayment` agora coleta automaticamente todas as informações necessárias:

```jsx
<PixPayment
  amount={1.00}
  description="Validação de conta bancária"
  onPaymentComplete={() => console.log('Pagamento confirmado!')}
  paymentId={accountId}
  caixinhaId={caixinhaId}
/>
```

### Validação de Dados

O sistema valida automaticamente:
- Email (formato válido)
- Nome e sobrenome (mínimo 2 caracteres)
- CPF/CNPJ (mínimo 11 dígitos)

## Resolução de Problemas

### Device ID não está sendo gerado
1. Verifique se `REACT_APP_MERCADO_PAGO_PUBLIC_KEY` está configurada
2. Confirme que o MercadoPago SDK foi carregado (verifique o console)
3. O sistema usará um fallback se houver problemas

### Campos obrigatórios
Se o backend retornar erro sobre campos obrigatórios:
1. Verifique se todos os campos estão sendo enviados
2. Confirme que o `deviceId` não está vazio
3. Verifique os logs do console para detalhes

### Problemas de Rede
O sistema inclui retry automático para chamadas de API através do `BaseService`.

## Logs e Debug

Para debugar problemas, verifique:
1. Console do navegador para logs do MercadoPago
2. Logs do `BankingService` para detalhes da requisição
3. Response do backend para identificar campos faltantes

## Próximos Passos

1. Testar com chave real do MercadoPago em produção
2. Ajustar valores de timeout conforme necessário
3. Implementar analytics para acompanhar taxa de sucesso
4. Considerar adicionar validação de CPF/CNPJ mais robusta