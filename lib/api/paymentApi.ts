// Payment API utility functions

export interface OrderDetails {
  _id: string;
  orderId: string;
  total_bayar: number;
  total_harga: number;
  status: string;
  payment_status: string;
  order_item: Array<{
    product_id: {
      name: string;
      price: number;
    };
    jumlah: number;
    subtotal: number;
  }>;
  shipping_address: {
    nama: string;
    alamat: string;
    kota: string;
  };
  snap_redirect_url?: string;
  payment_url?: string;
  createdAt: string;
}

// Fetch order details
export const fetchOrderDetails = async (orderId: string): Promise<OrderDetails | null> => {
  try {
    const response = await fetch(`/api/payment/order-details?orderId=${orderId}`, {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }

    const data = await response.json();
    
    // Handle different response structures
    if (data.order) {
      return data.order;
    } else if (data.success && data.data) {
      return data.data;
    } else if (data.orderId) {
      // Direct order object
      return data;
    } else {
      throw new Error('Invalid order data structure');
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

// Refresh payment status
export const refreshPaymentStatus = async (orderId: string): Promise<OrderDetails | null> => {
  try {
    const response = await fetch('/api/payment/refresh-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ orderId })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh payment status');
    }

    const data = await response.json();
    
    // Handle different response structures
    if (data.order) {
      return data.order;
    } else if (data.success && data.data) {
      return data.data;
    } else if (data.orderId) {
      // Direct order object
      return data;
    } else {
      throw new Error('Invalid order data structure');
    }
  } catch (error) {
    console.error('Error refreshing payment status:', error);
    return null;
  }
};

// Create payment
export const createPayment = async (paymentData: {
  orderId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    userId: string;
  };
  shippingDetails: {
    address: string;
    city: string;
    postalCode: string;
  };
}): Promise<{ redirect_url?: string; token?: string; message?: string; success?: boolean }> => {
  try {
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create payment');
    }

    return { ...result, success: true };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Create order
export const createOrder = async (orderData: {
  user_id: string;
  shipping_address: {
    nama: string;
    telepon: string;
    alamat: string;
    kota: string;
    kode_pos: string;
    provinsi: string;
  };
  ongkir: number;
  catatan: string;
  total_bayar: number;
}): Promise<{ order: any; message: string; success?: boolean }> => {
  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create order');
    }

    return { ...result, success: true };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}; 