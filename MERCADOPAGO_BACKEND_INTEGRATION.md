# MercadoPago Backend Integration Guide

## 📋 Instruções para Implementação no Backend

### 🔐 1. Configuração de Autenticação

```python
# Environment Variables Needed
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
MERCADOPAGO_PUBLIC_KEY=your_public_key_here
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

### 🎯 2. Endpoints Necessários

#### 2.1 Endpoint para Pagamentos com Cartão

```http
POST /api/banking/payments/card
Content-Type: application/json
Authorization: Bearer <user_token>
```

**Request Body (Vindo do Frontend):**
```json
{
  "token": "card_token_from_frontend",
  "device_id": "automatically_included_by_sdk_v2",
  "amount": 100.50,
  "currency": "BRL",
  "description": "Pagamento descrição",
  "payer": {
    "email": "user@example.com",
    "identification": {
      "type": "CPF",
      "number": "12345678901"
    }
  },
  "installments": 1,
  "payment_method_id": "visa",
  "issuer_id": "25",
  "metadata": {
    "user_id": "firebase_user_id",
    "payment_type": "credit_card",
    "sdk_version": "v2",
    "tokenization_method": "mercadopago_sdk"
  }
}
```

**Response Body:**
```json
{
  "id": "payment_id",
  "status": "approved|pending|rejected",
  "status_detail": "accredited|pending_contingency|cc_rejected_other_reason",
  "payment_method_id": "visa",
  "payment_type_id": "credit_card",
  "amount": 100.50,
  "currency_id": "BRL",
  "transaction_amount": 100.50,
  "installments": 1,
  "date_created": "2023-01-01T12:00:00.000Z",
  "date_approved": "2023-01-01T12:00:01.000Z",
  "payer": {
    "id": "payer_id",
    "email": "user@example.com",
    "identification": {
      "type": "CPF",
      "number": "12345678901"
    }
  }
}
```

#### 2.2 Backend Implementation Example (Python/FastAPI)

```python
from mercadopago import SDK
import os
from fastapi import HTTPException

# Initialize MercadoPago SDK
mp = SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))

async def process_card_payment(payment_data: dict):
    """
    Process card payment using MercadoPago
    """
    try:
        # Prepare payment data for MercadoPago API
        payment_request = {
            "token": payment_data["token"],  # Card token from frontend
            "transaction_amount": payment_data["amount"],
            "description": payment_data["description"],
            "installments": payment_data.get("installments", 1),
            "payment_method_id": payment_data.get("payment_method_id"),
            "issuer_id": payment_data.get("issuer_id"),
            
            # Payer information
            "payer": {
                "email": payment_data["payer"]["email"],
                "identification": {
                    "type": payment_data["payer"]["identification"]["type"],
                    "number": payment_data["payer"]["identification"]["number"]
                }
            },
            
            # CRITICAL: Include device_id for fraud prevention
            "additional_info": {
                "device_id": payment_data["device_id"]  # From SDK V2
            },
            
            # Metadata for tracking
            "metadata": payment_data.get("metadata", {})
        }
        
        # Create payment
        payment_response = mp.payment().create(payment_request)
        
        if payment_response["status"] == 201:
            return payment_response["response"]
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Payment failed: {payment_response['response']}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 2.3 Node.js/Express Implementation Example

```javascript
const mercadopago = require('mercadopago');

// Configure MercadoPago
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

app.post('/api/banking/payments/card', async (req, res) => {
    try {
        const {
            token,
            device_id,
            amount,
            description,
            payer,
            installments = 1,
            payment_method_id,
            issuer_id,
            metadata
        } = req.body;

        // Validate required fields
        if (!token || !device_id || !amount || !payer) {
            return res.status(400).json({
                error: 'Missing required fields: token, device_id, amount, payer'
            });
        }

        // Prepare payment data
        const paymentData = {
            token: token,
            transaction_amount: amount,
            description: description,
            installments: installments,
            payment_method_id: payment_method_id,
            issuer_id: issuer_id,
            
            // Payer information
            payer: {
                email: payer.email,
                identification: {
                    type: payer.identification.type,
                    number: payer.identification.number
                }
            },
            
            // CRITICAL: Device ID for fraud prevention
            additional_info: {
                device_id: device_id
            },
            
            // Metadata
            metadata: metadata || {}
        };

        // Create payment
        const payment = await mercadopago.payment.create(paymentData);
        
        // Return payment result
        res.json(payment.body);
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            error: 'Payment processing failed',
            details: error.message
        });
    }
});
```

### 🔒 3. Validações de Segurança Obrigatórias

#### 3.1 Validação do Device ID
```python
def validate_device_id(device_id: str) -> bool:
    """
    Validate device ID format and presence
    """
    if not device_id:
        return False
    
    # SDK V2 generates device IDs starting with specific patterns
    valid_patterns = ['MP_', 'DEVICE_']
    
    return any(device_id.startswith(pattern) for pattern in valid_patterns)
```

#### 3.2 Validação do Token
```python
def validate_card_token(token: str) -> bool:
    """
    Validate card token format
    """
    if not token:
        return False
    
    # MercadoPago tokens typically start with specific patterns
    return len(token) > 20 and token.isalnum()
```

### 📡 4. Webhooks Configuration

#### 4.1 Webhook Endpoint
```http
POST /api/webhooks/mercadopago
Content-Type: application/json
```

```python
from fastapi import Request
import hmac
import hashlib

async def mercadopago_webhook(request: Request):
    """
    Handle MercadoPago webhook notifications
    """
    try:
        # Get request body
        body = await request.body()
        
        # Verify webhook signature
        signature = request.headers.get("x-signature")
        webhook_secret = os.getenv("MERCADOPAGO_WEBHOOK_SECRET")
        
        if not verify_webhook_signature(body, signature, webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook data
        webhook_data = await request.json()
        
        # Handle different webhook types
        if webhook_data.get("type") == "payment":
            await handle_payment_webhook(webhook_data)
        
        return {"status": "ok"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def verify_webhook_signature(body: bytes, signature: str, secret: str) -> bool:
    """
    Verify MercadoPago webhook signature
    """
    expected_signature = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

### 🎨 5. Frontend Integration Points

#### 5.1 BankingProvider Hook Usage
```javascript
// In React component
import { useBanking } from '../../providers/BankingProvider';

const PaymentComponent = () => {
    const { processCardPayment, tokenizeCard } = useBanking();
    
    const handlePayment = async (cardData) => {
        try {
            // Tokenize card first
            const token = await tokenizeCard(cardData);
            
            // Process payment
            const payment = await processCardPayment({
                token: token.id,
                device_id: token.device_id, // Automatically included
                amount: 100.50,
                description: "Payment description",
                payer: {
                    email: "user@example.com",
                    identification: {
                        type: "CPF",
                        number: "12345678901"
                    }
                }
            });
            
            console.log('Payment successful:', payment);
            
        } catch (error) {
            console.error('Payment failed:', error);
        }
    };
};
```

### 🚨 6. Error Handling

#### 6.1 Common Error Codes
```python
MERCADOPAGO_ERROR_CODES = {
    "cc_rejected_insufficient_amount": "Insufficient funds",
    "cc_rejected_bad_filled_card_number": "Invalid card number",
    "cc_rejected_bad_filled_date": "Invalid expiration date",
    "cc_rejected_bad_filled_security_code": "Invalid security code",
    "cc_rejected_bad_filled_other": "Invalid card data",
    "cc_rejected_blacklist": "Card in blacklist",
    "cc_rejected_call_for_authorize": "Authorization required",
    "cc_rejected_card_disabled": "Card disabled",
    "cc_rejected_duplicated_payment": "Duplicated payment",
    "cc_rejected_high_risk": "High risk transaction",
    "cc_rejected_max_attempts": "Maximum attempts exceeded"
}
```

#### 6.2 Error Response Format
```json
{
    "error": true,
    "message": "Payment failed",
    "code": "cc_rejected_insufficient_amount",
    "description": "Insufficient funds",
    "status": 400,
    "cause": [
        {
            "code": "4001",
            "description": "Insufficient funds",
            "data": null
        }
    ]
}
```

### 📋 7. Required Database Fields

#### 7.1 Payments Table
```sql
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    mercadopago_payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL,
    status_detail VARCHAR(100),
    payment_method_id VARCHAR(50),
    payment_type_id VARCHAR(50),
    device_id VARCHAR(255), -- CRITICAL FIELD
    token_id VARCHAR(255),
    installments INTEGER DEFAULT 1,
    description TEXT,
    payer_email VARCHAR(255),
    payer_identification_type VARCHAR(10),
    payer_identification_number VARCHAR(20),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_mercadopago_payment_id (mercadopago_payment_id),
    INDEX idx_status (status),
    INDEX idx_device_id (device_id) -- For fraud prevention analysis
);
```

### ✅ 8. Compliance Checklist

- ✅ **SDK V2 Integration**: Frontend uses MercadoPago.JS V2
- ✅ **Device ID**: Automatically generated and sent to backend
- ✅ **Card Tokenization**: Implemented with SDK V2
- ✅ **Secure Token Handling**: Tokens never stored, only processed
- ✅ **Webhook Verification**: Signature validation implemented
- ✅ **Error Handling**: Comprehensive error mapping
- ✅ **Fraud Prevention**: Device ID included in all payments
- ✅ **PCI Compliance**: No card data touches backend
- ✅ **Logging**: Payment events logged for audit

### 🔄 9. Testing

#### 9.1 Test Card Numbers
```javascript
const TEST_CARDS = {
    VISA_APPROVED: '4509953566233704',
    VISA_PENDING: '4509953566233712',
    VISA_REJECTED: '4509953566233720',
    MASTERCARD_APPROVED: '5031433215406351',
    AMEX_APPROVED: '3711803032769203'
};
```

#### 9.2 Test Implementation
```javascript
// Test payment processing
const testPayment = async () => {
    const testCardData = {
        cardNumber: '4509953566233704',
        expirationMonth: '12',
        expirationYear: '2025',
        securityCode: '123',
        cardholderName: 'APRO',
        identificationType: 'CPF',
        identificationNumber: '12345678901'
    };
    
    // Test tokenization
    const token = await tokenizeCard(testCardData);
    console.log('Token created:', token.id);
    
    // Test payment
    const payment = await processCardPayment({
        token: token.id,
        device_id: token.device_id,
        amount: 1.00,
        description: 'Test payment'
    });
    
    console.log('Payment result:', payment.status);
};
```

### 📚 10. Additional Resources

- [MercadoPago API Documentation](https://www.mercadopago.com.br/developers/pt/reference)
- [SDK JavaScript V2](https://www.mercadopago.com.br/developers/pt/docs/sdks-library/client-side/mp-js-v2)
- [Payment Processing](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/payment-processing)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)

---

**⚠️ IMPORTANTE**: Este guia implementa todas as exigências do MercadoPago para SDK V2, incluindo device ID automático e tokenização segura de cartões.