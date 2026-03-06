import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/api';
import Layout from '../components/Layout';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        emailAddress: '',
        password: '',
        confirmPassword: '',
        userType: '',
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        mobileNumber: '',
        phoneNumber: '',
        address: '',
        postCode: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Minimum eight characters, at least one letter, one number, and one special character
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };



    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateEmail(formData.emailAddress)) {
            toast.error('Invalid email address!', { autoClose: 3000 });
            return;
        }

        if (!validatePassword(formData.password)) {
            toast.error('Password must be at least 8 characters long and include at least one letter, one number, and one special character!', { autoClose: 5000 });
            return;
        }

        

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match!", { autoClose: 3000 });
            return;
        }

        try {
            const response = await api.post('/User/register', formData);
            if (response.data.success) {
                toast.success('Registration successful! Redirecting to login...', { autoClose: 3000 });
                setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
            } else {
                toast.error('Registration failed. Please try again.', { autoClose: 3000 });
            }
        } catch (error) {
            if (error.response) {
                toast.error(`Error: ${error.response.data.message || error.response.data}`, { autoClose: 3000 });
            } else {
                toast.error('Network error: Please check your connection.', { autoClose: 3000 });
            }
        }
    };

    return (
        <Layout>
            <Container className="mt-5">
                <ToastContainer />
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card>
                            <Card.Body>
                                <h2 className="text-center">Register</h2>
                                <Form onSubmit={handleRegister}>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            placeholder="Enter username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formEmail" className="mt-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="emailAddress"
                                            placeholder="Enter email"
                                            value={formData.emailAddress}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formPassword" className="mt-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formConfirmPassword" className="mt-3">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formUserType" className="mt-3">
                                        <Form.Label>User Type</Form.Label>
                                        <Form.Select
                                            name="userType"
                                            value={formData.userType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select user type</option>
                                            <option value="0">Student</option>
                                            <option value="1">Teacher</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group controlId="formFirstName" className="mt-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            placeholder="Enter first name"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formLastName" className="mt-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            placeholder="Enter last name"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formGender" className="mt-3">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={(e) => {
                                                const value = e.target.value === "true" ? true : e.target.value === "false" ? false : null;
                                                handleChange({ target: { name: "gender", value } });
                                            }}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="true">Male</option>
                                            <option value="false">Female</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group controlId="formDateOfBirth" className="mt-3">
                                        <Form.Label>Date of Birth</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth ?? ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formMobileNumber" className="mt-3">
                                        <Form.Label>Mobile Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="mobileNumber"
                                            placeholder="Enter mobile number"
                                            value={formData.mobileNumber}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formPhoneNumber" className="mt-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="phoneNumber"
                                            placeholder="Enter phone number"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formAddress" className="mt-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address"
                                            placeholder="Enter address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="formPostCode" className="mt-3">
                                        <Form.Label>Post Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="postCode"
                                            placeholder="Enter post code"
                                            value={formData.postCode}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="mt-4 w-100">
                                        Register
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
};

export default RegisterPage;