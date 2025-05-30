import React, { useState } from 'react';
import './CheckoutPage.css'; // To be created

// Mockup classes for styling reference:
// .checkout-container: display: flex; gap: 2rem;
// .payment-details: flex: 2;
// .order-summary: flex: 1; background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;
// .wf-form-group, .wf-label, .wf-input, .wf-button (as used before)
// .payment-method-selector .method: border: 1px solid #cbd5e1; padding: 1rem; border-radius: 0.25rem; cursor: pointer;
// .payment-method-selector .method.active: border-color: #3b82f6; box-shadow: 0 0 0 2px #3b82f6;

const CheckoutPage = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard'); // 'creditCard', 'paypal', 'mpesa'
  const [formData, setFormData] = useState({
    // Credit Card
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    // Billing Info
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Actual payment processing logic will be added later
    alert('Submitting checkout form (UI only)... Selected: ' + selectedPaymentMethod + JSON.stringify(formData, null, 2));
  };

  // Mock data for order summary
  const orderDetails = {
    agentName: "Data Analyzer Pro v2.1",
    licenseType: "Single User License",
    price: 79.99,
    taxRate: 0.08, // 8%
    processingFee: 2.50,
  };
  const subtotal = orderDetails.price;
  const taxAmount = subtotal * orderDetails.taxRate;
  const totalAmount = subtotal + taxAmount + orderDetails.processingFee;


  return (
    <div className="checkout-page-container">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit} className="checkout-form-layout">
        {/* Left Column: Payment and Billing Details */}
        <div className="payment-billing-details">
          {/* Payment Method Selection */}
          <section className="payment-method-section form-section">
            <h2>Select Payment Method</h2>
            <div className="payment-method-selector">
              <div 
                className={`method ${selectedPaymentMethod === 'creditCard' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('creditCard')}
              >
                💳 Credit/Debit Card
              </div>
              <div 
                className={`method ${selectedPaymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('paypal')}
              >
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg" alt="PayPal" style={{height: '24px', verticalAlign: 'middle'}}/> PayPal
              </div>
              <div 
                className={`method ${selectedPaymentMethod === 'mpesa' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('mpesa')}
              >
                📱 M-Pesa
              </div>
            </div>
          </section>

          {/* Credit Card Details Form (Conditional) */}
          {selectedPaymentMethod === 'creditCard' && (
            <section className="credit-card-details-section form-section">
              <h2>Credit Card Details</h2>
              <div className="wf-form-group">
                <label htmlFor="cardholderName" className="wf-label">Cardholder Name</label>
                <input type="text" id="cardholderName" name="cardholderName" className="wf-input" value={formData.cardholderName} onChange={handleInputChange} required />
              </div>
              <div className="wf-form-group">
                <label htmlFor="cardNumber" className="wf-label">Card Number</label>
                <input type="text" id="cardNumber" name="cardNumber" className="wf-input" placeholder="•••• •••• •••• ••••" value={formData.cardNumber} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="wf-form-group">
                  <label htmlFor="expiryDate" className="wf-label">Expiry Date</label>
                  <input type="text" id="expiryDate" name="expiryDate" className="wf-input" placeholder="MM/YY" value={formData.expiryDate} onChange={handleInputChange} required />
                </div>
                <div className="wf-form-group">
                  <label htmlFor="cvv" className="wf-label">CVV</label>
                  <input type="text" id="cvv" name="cvv" className="wf-input" placeholder="•••" value={formData.cvv} onChange={handleInputChange} required />
                </div>
              </div>
            </section>
          )}
          
          {selectedPaymentMethod === 'paypal' && (
            <section className="paypal-section form-section">
              <h2>PayPal Checkout</h2>
              <p>You will be redirected to PayPal to complete your payment securely.</p>
              {/* Placeholder for PayPal button or redirect logic */}
              <button type="button" className="wf-button paypal-button" style={{background: '#ffc439', color: '#253b80'}}>Proceed to PayPal</button>
            </section>
          )}

          {selectedPaymentMethod === 'mpesa' && (
            <section className="mpesa-section form-section">
              <h2>M-Pesa Checkout</h2>
              <div className="wf-form-group">
                <label htmlFor="mpesaPhone" className="wf-label">Phone Number (e.g. 0712345678)</label>
                <input type="tel" id="mpesaPhone" name="mpesaPhone" className="wf-input" placeholder="0712345678" value={formData.mpesaPhone || ''} onChange={handleInputChange} required />
              </div>
              <p>You will receive a prompt on your phone to complete the payment.</p>
            </section>
          )}


          {/* Billing Information Form */}
          <section className="billing-info-section form-section">
            <h2>Billing Information</h2>
            <div className="form-row">
              <div className="wf-form-group">
                <label htmlFor="firstName" className="wf-label">First Name</label>
                <input type="text" id="firstName" name="firstName" className="wf-input" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="wf-form-group">
                <label htmlFor="lastName" className="wf-label">Last Name</label>
                <input type="text" id="lastName" name="lastName" className="wf-input" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="wf-form-group">
              <label htmlFor="email" className="wf-label">Email Address</label>
              <input type="email" id="email" name="email" className="wf-input" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="wf-form-group">
              <label htmlFor="address" className="wf-label">Street Address</label>
              <input type="text" id="address" name="address" className="wf-input" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div className="form-row">
              <div className="wf-form-group">
                <label htmlFor="city" className="wf-label">City</label>
                <input type="text" id="city" name="city" className="wf-input" value={formData.city} onChange={handleInputChange} required />
              </div>
              <div className="wf-form-group">
                <label htmlFor="zipCode" className="wf-label">ZIP / Postal Code</label>
                <input type="text" id="zipCode" name="zipCode" className="wf-input" value={formData.zipCode} onChange={handleInputChange} required />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="order-summary-sidebar">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>{orderDetails.agentName}</span>
            <span>${orderDetails.price.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>{orderDetails.licenseType}</span>
            {/* <span>Included</span> */}
          </div>
          <hr />
          <div className="summary-item">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax ({ (orderDetails.taxRate * 100).toFixed(0) }%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Processing Fee</span>
            <span>${orderDetails.processingFee.toFixed(2)}</span>
          </div>
          <hr />
          <div className="summary-item total-amount">
            <span>Total Amount</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <button type="submit" className="wf-button complete-purchase-button">
            Complete Purchase
          </button>
          <p className="secure-checkout-text">
            🔒 Your payment is secure and encrypted.
          </p>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
