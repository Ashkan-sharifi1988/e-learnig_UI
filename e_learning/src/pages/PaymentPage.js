import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import '../assets/PaymentPage.css'; // External CSS for styling
import { Basket } from '../context/Basket';

const PaymentPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { userId } = useContext(AuthContext); // Get userId from AuthContext
    const totalAmount = parseFloat(state?.totalAmount || 0); // Ensure totalAmount is a number
    const courseIDs = state?.courseIDs || []; // Ensure courseIDs is an array
    const { clearBasket} = useContext(Basket);

    const handlePayment = async () => {
        try {
            const currentDate = new Date().toISOString();
            const paymentData = courseIDs.map((courseID) => ({
                userID: userId,
                courseID: courseID,
                hasPaid: true,
            }));

            await api.post('/UserCourse/AddPaidCourses', paymentData);
        

            alert('Payment successful!');
            navigate(-1); // Navigate to the courses page
            clearBasket();
        } catch (error) {
            console.error('Payment failed', error);
            alert('Payment failed');
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1 className="payment-title">Payment Gateway</h1>
                <p className="payment-amount">
                    Total Amount: <strong>${totalAmount.toFixed(2)}</strong>
                </p>
                <form className="payment-form">
                    <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" className="form-control" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cardName">Name on Card</label>
                        <input type="text" id="cardName" className="form-control" placeholder="John Doe" />
                    </div>
                    <div className="form-group row">
                        <div className="col-md-6">
                            <label htmlFor="expiryDate">Expiry Date</label>
                            <input type="text" id="expiryDate" className="form-control" placeholder="MM/YY" />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="cvv">CVV</label>
                            <input type="password" id="cvv" className="form-control" placeholder="123" />
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-block pay-button"
                        onClick={handlePayment}
                    >
                        Pay ${totalAmount.toFixed(2)}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;
