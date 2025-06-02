import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import userService from '../../services/userService'; // Import userService
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [agentToPurchase, setAgentToPurchase] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    mpesaPhone: '',
  });

  useEffect(() => {
    if (location.state && location.state.agent) {
      setAgentToPurchase(location.state.agent);
    } else {
      // Handle case where agent data isn't passed, maybe redirect or show error
      // For now, let's set a placeholder or redirect
      setError("No agent selected for checkout. Please select an agent first.");
      // Example: navigate('/agents');
      // Or use a placeholder for demonstration if direct access to /checkout is allowed for UI dev
      setAgentToPurchase({
        name: "Placeholder Agent (Select from list)",
        price: 0.00,
        id: null,
      });
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setCreatedOrder(null);

    if (!agentToPurchase || !agentToPurchase.id) {
      setError("Agent information is missing. Cannot create order.");
      return;
    }
    if (selectedPaymentMethod === 'creditCard') {
        // Basic validation for credit card fields
        if(!formData.cardholderName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
            setError("Please fill in all required credit card details.");
            return;
        }
    }
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.zipCode) {
        setError("Please fill in all required billing information.");
        return;
    }


    setIsLoading(true);
    try {
      const orderData = await userService.createOrder(agentToPurchase.id);
      setCreatedOrder(orderData);
      setSuccessMessage(`Order created successfully! Order ID: ${orderData.order_id}. Please proceed to payment.`);
      // Disable form fields, show next step button, etc.
      // For now, just display success and order ID. Actual payment is next step.
      console.log("Order created:", orderData);
      // Potentially redirect to a payment page or update UI to show payment options for this order.
      // navigate(`/payment/${orderData.order_id}`); // Example
    } catch (err) {
      setError(err.detail || err.message || "Failed to create order. Please try again.");
      console.error("Order creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate amounts for Order Summary
  const price = agentToPurchase?.price ? parseFloat(agentToPurchase.price) : 0.00;
  const taxRate = 0.08; // 8% example
  const processingFee = 2.50; // Example
  const subtotal = price;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount + processingFee;

  if (!agentToPurchase && !error) { // Still waiting for location state or initial error
    return <div className="loading-message">Loading checkout details...</div>;
  }

  return (
    <div className="checkout-page-container">
      <h1>Checkout</h1>

      {error && <div className="error-message global-error">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {isLoading && <div className="loading-indicator">Processing...</div>}

      {createdOrder && (
        <div className="order-created-summary form-section">
          <h2>Order Pending Payment</h2>
          <p><strong>Order ID:</strong> {createdOrder.order_id}</p>
          <p><strong>Agent:</strong> {createdOrder.agent?.name}</p>
          <p><strong>Amount:</strong> ${parseFloat(createdOrder.price_at_purchase).toFixed(2)}</p>
          <p>Status: {createdOrder.status}</p>
          <p><em>Next step: Integrate with payment gateway to complete this purchase.</em></p>
          {/* Add a button here to proceed to actual payment if it was a separate step */}
        </div>
      )}

      {!createdOrder && agentToPurchase && ( // Show form only if order not yet created and agent data is available
        <form onSubmit={handleFormSubmit} className="checkout-form-layout">
          <div className="payment-billing-details">
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
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg" alt="PayPal Logo" style={{height: '24px', verticalAlign: 'middle'}}/> PayPal
                </div>
                <div
                  className={`method ${selectedPaymentMethod === 'mpesa' ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange('mpesa')}
                >
                  📱 M-Pesa
                </div>
              </div>
            </section>

            {selectedPaymentMethod === 'creditCard' && (
              <section className="credit-card-details-section form-section">
                <h2>Credit Card Details</h2>
                <div className="wf-form-group">
                  <label htmlFor="cardholderName" className="wf-label">Cardholder Name</label>
                  <input type="text" id="cardholderName" name="cardholderName" className="wf-input" value={formData.cardholderName} onChange={handleInputChange} required={selectedPaymentMethod === 'creditCard'} />
                </div>
                <div className="wf-form-group">
                  <label htmlFor="cardNumber" className="wf-label">Card Number</label>
                  <input type="text" id="cardNumber" name="cardNumber" className="wf-input" placeholder="•••• •••• •••• ••••" value={formData.cardNumber} onChange={handleInputChange} required={selectedPaymentMethod === 'creditCard'} />
                </div>
                <div className="form-row">
                  <div className="wf-form-group">
                    <label htmlFor="expiryDate" className="wf-label">Expiry Date</label>
                    <input type="text" id="expiryDate" name="expiryDate" className="wf-input" placeholder="MM/YY" value={formData.expiryDate} onChange={handleInputChange} required={selectedPaymentMethod === 'creditCard'} />
                  </div>
                  <div className="wf-form-group">
                    <label htmlFor="cvv" className="wf-label">CVV</label>
                    <input type="text" id="cvv" name="cvv" className="wf-input" placeholder="•••" value={formData.cvv} onChange={handleInputChange} required={selectedPaymentMethod === 'creditCard'} />
                  </div>
                </div>
              </section>
            )}

            {selectedPaymentMethod === 'paypal' && (
              <section className="paypal-section form-section">
                <h2>PayPal Checkout</h2>
                <p>You will be redirected to PayPal to complete your payment securely.</p>
                <button type="button" className="wf-button paypal-button" style={{background: '#ffc439', color: '#253b80'}}>Proceed to PayPal (UI Only)</button>
              </section>
            )}

            {selectedPaymentMethod === 'mpesa' && (
              <section className="mpesa-section form-section">
                <h2>M-Pesa Checkout</h2>
                <div className="wf-form-group">
                  <label htmlFor="mpesaPhone" className="wf-label">Phone Number (e.g. 0712345678)</label>
                  <input type="tel" id="mpesaPhone" name="mpesaPhone" className="wf-input" placeholder="0712345678" value={formData.mpesaPhone} onChange={handleInputChange} required={selectedPaymentMethod === 'mpesa'} />
                </div>
                <p>You will receive a prompt on your phone to complete the payment.</p>
              </section>
            )}

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

          <aside className="order-summary-sidebar">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>{agentToPurchase?.name || "Agent Name"}</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>{agentToPurchase?.licenseType || "Standard License"}</span>
            </div>
            <hr />
            <div className="summary-item">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Processing Fee</span>
              <span>${processingFee.toFixed(2)}</span>
            </div>
            <hr />
            <div className="summary-item total-amount">
              <span>Total Amount</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <button type="submit" className="wf-button complete-purchase-button" disabled={isLoading || !agentToPurchase?.id}>
              {isLoading ? 'Processing...' : 'Confirm & Create Order'}
            </button>
            <p className="secure-checkout-text">
              🔒 Your payment is secure and encrypted.
            </p>
          </aside>
        </form>
      )}
    </div>
  );
};

export default CheckoutPage;
