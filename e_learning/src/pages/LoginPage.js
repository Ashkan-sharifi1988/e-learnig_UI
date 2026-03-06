import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import axios from 'axios';
import '../assets/LoginPage.scss';
import bgImage from '../assets/Images/bg-1.jpg';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const [Identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/User/login', { Identifier, password });

            if (response.data.success) {
                const { token, user, type } = response.data.data;

                // Set Authorization header for Axios globally
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Persist login state based on "Remember Me"
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('authToken', token);
                storage.setItem('userID', user);
                storage.setItem('userType', type);

                // Call login function from AuthContext
                login(token, user, type);

                toast.success('Login successful! Redirecting...', {
                    position: 'top-center',
                    transition: Slide,
                });

                // Navigate based on user type
                const redirectPaths = {
                    0: '/home',
                    1: '/tutors',
                    2: '/admin',
                };

                setTimeout(() => navigate(redirectPaths[type] || '/home'), 1000);
            } else {
                throw new Error(response.data.message || 'Invalid credentials');
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || 'Login failed. Please try again.';
            toast.error(errorMessage, {
                position: 'top-center',
                transition: Slide,
            });
        }
    };

    return (
        <section className="ftco-section">
            <ToastContainer />
            <Container className="d-flex justify-content-center">
                <Row className="justify-content-center w-100">
                    <Col md={12} lg={10} className="d-flex align-items-center">
                        <div className="wrap d-md-flex">
                            <div
                                className="img"
                                style={{ backgroundImage: `url(${bgImage})` }}
                            ></div>
                            <div className="login-wrap p-4 p-md-5">
                                <div className="d-flex justify-content-between">
                                    <h3 className="mb-4">Sign In</h3>
                                </div>
                                <Form onSubmit={handleLogin} className="signin-form">
                                    <Form.Group controlId="formEmail" className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter email or username"
                                            value={Identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formPassword" className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <div className="form-group d-flex justify-content-between align-items-center">
                                        <Form.Check
                                            type="checkbox"
                                            label="Remember Me"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <button type="button" className="btn btn-link p-0">
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="form-group">
                                        <Button
                                            type="submit"
                                            className="form-control btn btn-primary rounded submit px-3"
                                        >
                                            Sign In
                                        </Button>
                                    </div>
                                </Form>
                                <p className="text-center">
                                    Not a member? <a href="/register">Sign Up</a>
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default LoginPage;
