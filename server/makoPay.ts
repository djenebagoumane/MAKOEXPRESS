import crypto from 'crypto';

export interface MakoPayConfig {
  apiKey: string;
  secretKey: string;
  merchantId: string;
  baseUrl: string;
}

export interface MakoPayPaymentRequest {
  amount: number;
  currency: string;
  customerPhone: string;
  orderId: string;
  description: string;
  webhookUrl?: string;
}

export interface MakoPayTransferRequest {
  amount: number;
  currency: string;
  recipientPhone: string;
  reference: string;
  description: string;
}

export interface MakoPayResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  data?: any;
}

export class MakoPayService {
  private config: MakoPayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.MAKOPAY_API_KEY || '',
      secretKey: process.env.MAKOPAY_SECRET_KEY || '',
      merchantId: process.env.MAKOPAY_MERCHANT_ID || '',
      baseUrl: process.env.MAKOPAY_BASE_URL || 'https://api.makopay.ml'
    };
  }

  private generateSignature(payload: string, timestamp: string): string {
    const data = `${timestamp}${payload}`;
    return crypto.createHmac('sha256', this.config.secretKey).update(data).digest('hex');
  }

  private async makeRequest(endpoint: string, data: any): Promise<MakoPayResponse> {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify(data);
    const signature = this.generateSignature(payload, timestamp);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Merchant-ID': this.config.merchantId,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: payload
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        transactionId: result.transaction_id || '',
        status: result.status || 'failed',
        message: result.message || 'Transaction processed',
        data: result
      };
    } catch (error) {
      console.error('MakoPay API Error:', error);
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Service de paiement temporairement indisponible'
      };
    }
  }

  async processPayment(request: MakoPayPaymentRequest): Promise<MakoPayResponse> {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('Configuration MakoPay manquante. Veuillez configurer les clés API.');
    }

    const paymentData = {
      amount: request.amount,
      currency: request.currency || 'XOF',
      customer_phone: request.customerPhone,
      order_id: request.orderId,
      description: request.description,
      webhook_url: request.webhookUrl,
      merchant_id: this.config.merchantId
    };

    return await this.makeRequest('/v1/payments', paymentData);
  }

  async transferMoney(request: MakoPayTransferRequest): Promise<MakoPayResponse> {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('Configuration MakoPay manquante. Veuillez configurer les clés API.');
    }

    const transferData = {
      amount: request.amount,
      currency: request.currency || 'XOF',
      recipient_phone: request.recipientPhone,
      reference: request.reference,
      description: request.description,
      merchant_id: this.config.merchantId
    };

    return await this.makeRequest('/v1/transfers', transferData);
  }

  async checkTransactionStatus(transactionId: string): Promise<MakoPayResponse> {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('Configuration MakoPay manquante. Veuillez configurer les clés API.');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-Merchant-ID': this.config.merchantId,
        }
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        transactionId: result.transaction_id || transactionId,
        status: result.status || 'failed',
        message: result.message || 'Status retrieved',
        data: result
      };
    } catch (error) {
      console.error('MakoPay Status Check Error:', error);
      return {
        success: false,
        transactionId,
        status: 'failed',
        message: 'Impossible de vérifier le statut de la transaction'
      };
    }
  }

  async getAccountBalance(): Promise<{ success: boolean; balance: number; currency: string }> {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('Configuration MakoPay manquante. Veuillez configurer les clés API.');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/balance`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-Merchant-ID': this.config.merchantId,
        }
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        balance: result.balance || 0,
        currency: result.currency || 'XOF'
      };
    } catch (error) {
      console.error('MakoPay Balance Check Error:', error);
      return {
        success: false,
        balance: 0,
        currency: 'XOF'
      };
    }
  }

  validateWebhook(signature: string, payload: string, timestamp: string): boolean {
    const expectedSignature = this.generateSignature(payload, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Méthodes utilitaires pour MAKOEXPRESS
  async processOrderPayment(orderId: string, amount: number, customerPhone: string): Promise<MakoPayResponse> {
    return await this.processPayment({
      amount,
      currency: 'XOF',
      customerPhone,
      orderId,
      description: `Paiement commande MAKOEXPRESS #${orderId}`,
      webhookUrl: `${process.env.APP_URL}/api/webhooks/makopay`
    });
  }

  async transferToDriver(driverId: string, amount: number, driverPhone: string, orderId: string): Promise<MakoPayResponse> {
    return await this.transferMoney({
      amount,
      currency: 'XOF',
      recipientPhone: driverPhone,
      reference: `DRIVER_${driverId}_${orderId}`,
      description: `Paiement livreur MAKOEXPRESS - Commande #${orderId}`
    });
  }

  calculateCommissionSplit(totalAmount: number, commissionRate: number) {
    const commission = Math.round(totalAmount * commissionRate);
    const driverAmount = totalAmount - commission;
    
    return {
      totalAmount,
      commission,
      driverAmount,
      commissionRate
    };
  }
}

export const makoPayService = new MakoPayService();