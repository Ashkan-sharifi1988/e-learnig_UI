import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Navbar, Nav, Container, NavDropdown, Image, Dropdown, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Basket } from '../context/Basket';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import config from '../config';
import Notification from './Notification';
import { BsBasket } from 'react-icons/bs'; // Import basket icon
import noImageCourse from '../assets/Images/No-Image-Course.png';
import noImageProfile from '../assets/Images/No-Image-Profile.png';
import "../assets/Navbar.css";

const NavbarComponent = () => {
    const { isAuthenticated, userId, logout } = useContext(AuthContext);
    const { basket, removeFromBasket, setUserId, clearBasket } = useContext(Basket);

    const [profile, setProfile] = useState({
        userName: "",
        profilePicture: null,
        userType: null,
    });
    const [basketDetails, setBasketDetails] = useState([]);

    const navigate = useNavigate();

    // Fetch course details for basket items
    const fetchCourseDetails = useCallback(async () => {
        try {
            if (basket.length === 0) {
                setBasketDetails([]); // Clear basket details if no items are present
                return;
            }

            const details = await Promise.all(
                basket.map(async (courseId) => {
                    const response = await api.get(`/Course/${courseId}`);
                    const course = response.data;
                    return {
                        courseId: course.courseID,
                        name: course.courseName,
                        imageUrl: course.coursePicture,
                        price: course.courseCost || 0,
                        discountedPrice: course.courseDiscount
                            ? course.courseCost - (course.courseCost * course.courseDiscount) / 100
                            : course.courseCost,
                    };
                })
            );

            setBasketDetails(details); // Update basketDetails with transformed data
        } catch (error) {
            console.error('Error fetching course details:', error);
        }
    }, [basket]);

    // Calculate total price
    const calculateTotalPrice = () =>
        basketDetails.reduce((total, course) => total + (course.discountedPrice || course.price || 0), 0).toFixed(2);

    // Handle user logout
    const handleLogout = () => {
        clearBasket();
        logout();
        // navigate('/login');
    };

    // Navigate to payment page
    const handleGoToPayment = () => {
        if (!basketDetails.length) {
            alert('Your basket is empty.');
            return;
        }

        const courseIDs = basketDetails.map((course) => course.courseId);
        const totalAmount = calculateTotalPrice();

        navigate('/payment', {
            state: { courseIDs, totalAmount },
        });
    };

    // Fetch user profile and course details when userId changes
    useEffect(() => {
        if (userId) {
            setUserId(userId);

            const fetchProfile = async () => {
                try {
                    const response = await api.get(`/profile/${userId}`);
                    if (response.data) {
                        setProfile({
                            userName: response.data.username,
                            profilePicture: response.data.profileImageUrl
                                ? `${config.BaseUrl}${response.data.profileImageUrl}`
                                : noImageProfile,
                            userType: response.data.userType,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            };

            fetchProfile();
            fetchCourseDetails();
        } else {
            setBasketDetails([]);
        }
    }, [userId, fetchCourseDetails, setUserId]);

    // Determine user role based on profile
    const getUserRole = () => {
        const role = profile.userType;
        if (role === 0) return 'student';
        if (role === 1) return 'teacher';
        if (role === 2) return 'admin';
        return 'guest';
    };


    const handleNavigate = (path) => {
        navigate(path);
    };

    // Render navigation items based on user role
    const renderNavItems = () => {
        const role = getUserRole();
        switch (role) {
            case 'student':
                return (
                    <>
                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("/usercourses")}

                        >
                            My Courses
                        </Nav.Link>
                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("/exams")}

                        >
                            My Exams
                        </Nav.Link>

                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("/MyLearningPaths")}

                        >
                            My Learning Paths
                        </Nav.Link>

                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("/LearningPaths")}

                        >
                            Learning Paths
                        </Nav.Link>
                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("#")}

                        >
                            Tutors
                        </Nav.Link>

                    </>
                );
            case 'teacher':
                return (
                    <>
                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("/CourseMgn")}

                        >
                            Course Management
                        </Nav.Link>
                        <Nav.Link
                            as="button"
                            onClick={() => handleNavigate("/LearningPathsMgn")}

                        >
                            LearningPaths Management            </Nav.Link>

                    </>
                );
            case 'admin':
                return (
                    <>
                        <Nav.Link href="/admin-dashboard">Dashboard</Nav.Link>
                        <Nav.Link href="/manage-users">Manage Users</Nav.Link>
                        <Nav.Link href="/settings">Settings</Nav.Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Navbar bg="light" expand="lg" className="navbar-container">
            <Container>
                <Navbar.Brand href="/home">E-Learning</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">{isAuthenticated && renderNavItems()}</Nav>

                    <Nav className="ms-auto d-flex align-items-center">
                        {isAuthenticated ? (
                            <>
                                {/* Basket Icon with Counter and Dropdown for Students */}
                                {profile.userType === 0 && (
                                    <Dropdown align="end" className="me-3">
                                        <Dropdown.Toggle
                                            as="div"
                                            style={{ cursor: 'pointer', position: 'relative' }}
                                        >
                                            <BsBasket size={30} />
                                            {basket.length > 0 && (
                                                <Badge
                                                    bg="danger"
                                                    pill
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px',
                                                        right: '-10px',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    {basket.length}
                                                </Badge>
                                            )}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {basketDetails.length > 0 ? (
                                                <>
                                                    {basketDetails.map((course) => (
                                                        <Dropdown.Item key={course.courseId}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img
                                                                    src={course.imageUrl || course.coursePicture ? config.BaseUrl + course.imageUrl : noImageCourse}
                                                                    // src={course.coursePicture ?  config.BaseUrl + course.coursePicture  : noImageCourse}

                                                                    alt={course.name || 'Unnamed Course'}
                                                                    style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        objectFit: 'cover',
                                                                        marginRight: '10px',
                                                                    }}
                                                                />
                                                                <span style={{ flex: 1, fontWeight: 'bold' }}>
                                                                    {course.name || 'Unnamed Course'}
                                                                </span>
                                                                <button
                                                                    onClick={() => removeFromBasket(course.courseId)}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: 'red',
                                                                        fontSize: '16px',
                                                                        cursor: 'pointer',
                                                                        margin: '0 0 0 10px'
                                                                    }}
                                                                    aria-label="Remove"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </Dropdown.Item>
                                                    ))}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item>
                                                        <div style={{ fontWeight: 'bold' }}>
                                                            Total Price: £{calculateTotalPrice()}
                                                        </div>
                                                        <button
                                                            style={{
                                                                backgroundColor: '#007bff',
                                                                color: '#fff',
                                                                border: 'none',
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                marginTop: '10px',
                                                                width: '100%',
                                                            }}
                                                            onClick={handleGoToPayment}
                                                        >
                                                            Go to Payment
                                                        </button>
                                                    </Dropdown.Item>
                                                </>
                                            ) : (
                                                <Dropdown.Item>Your basket is empty</Dropdown.Item>
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}

                                {/* Profile Dropdown */}
                                <NavDropdown
                                    title={
                                        profile.profilePicture ? (
                                            <Image
                                                src={profile.profilePicture}
                                                roundedCircle
                                                width="40"
                                                height="40"
                                                alt="Profile"
                                            />
                                        ) : (
                                            <span>{profile.userName || 'User'}</span>
                                        )
                                    }
                                    id="profile-dropdown"
                                >
                                    <NavDropdown.Header >{profile.userName || 'User'}</NavDropdown.Header>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={() => navigate('/profile')}>Account</NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => navigate('/settings')}>Settings</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                </NavDropdown>

                                {/* Notification Component */}
                                <Notification userId={userId} />
                            </>
                        ) : (
                            <>
                                <Nav.Link href="/login">Login</Nav.Link>
                                <Nav.Link href="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;
