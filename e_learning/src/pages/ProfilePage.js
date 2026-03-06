import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../components/Layout";
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { isAuthenticated, userId, logout } = useContext(AuthContext); // userId should be a string
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        phoneNumber: "",
        address: "",
        postCode: "",
        profilePicture: null, // for uploading
    });
    const navigate = useNavigate();

    // Fetch user profile data on load if authenticated
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (isAuthenticated && userId) {
                    const response = await api.get(`/profile/${userId}`);
                    setProfile({
                        ...response.data,
                        profilePicture: null, // Clear file input field
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile.");
            }
        };

        if (isAuthenticated && userId) {
            fetchProfile();
        }
    }, [isAuthenticated, userId]);

    // Handle input changes for text fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    // Handle profile picture file input
    const handleFileChange = (e) => {
        const file = e.target.files[0] || null; // If no file is selected, set it to null
        setProfile((prev) => ({ ...prev, profilePicture: file }));
    };

    // Submit profile update
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Append text fields
        formData.append("firstName", profile.firstName);
        formData.append("lastName", profile.lastName);
        formData.append("mobileNumber", profile.mobileNumber);
        formData.append("phoneNumber", profile.phoneNumber);
        formData.append("address", profile.address);
        formData.append("postCode", profile.postCode);

        // Append profile picture
        formData.append("profileImage", profile.profilePicture || "");

        try {
            await api.put(`/profile/${userId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Profile updated successfully!");
            setTimeout(() => navigate("/home"), 2000); // Redirect after 2 seconds
        } catch (error) {
            console.error("Error updating profile:", error.response?.data || error.message);
            toast.error("An error occurred while updating the profile.");
        }
    };

    return (
        <Layout>
        <Container className="mt-1 ">
            <ToastContainer />
            <Row className="justify-content-center">
                    <Col md={8}>
                        <Card>
                            <Card.Body>
            <h2 className="text-center">My Profile</h2>
            <Form onSubmit={handleSave}>
                <Form.Group controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="lastName" className="mt-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="mobileNumber" className="mt-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                        type="text"
                        name="mobileNumber"
                        value={profile.mobileNumber}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="phoneNumber" className="mt-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        name="phoneNumber"
                        value={profile.phoneNumber}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="address" className="mt-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="postCode" className="mt-3">
                    <Form.Label>Post Code</Form.Label>
                    <Form.Control
                        type="text"
                        name="postCode"
                        value={profile.postCode}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="profilePicture" className="mt-3">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                        type="file"
                        onChange={handleFileChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3 mb-3">
                    Save
                </Button>
            </Form>
            {/* <Button variant="secondary" onClick={logout} className="mt-3">
                Logout
            </Button> */}
                              </Card.Body>
                        </Card>
                    </Col>
                </Row>
        </Container>
        </Layout>
    );
};

export default ProfilePage;
