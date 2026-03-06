import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Alert, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaWifi, FaVideo, FaDollarSign } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import noImageCourse from '../assets/Images/No-Image-Course.png';
import Layout from '../components/Layout';
import config from '../config';
import TagComponent from '../components/Tag';
import AttachmentModal from '../components/AttachmentModal';

const CoursePage = () => {
    const navigate = useNavigate();

    const { userId } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [errors, setErrors] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [courseData, setCourseData] = useState({
        courseName: '',
        courseCategoryID: '',
        courseDescription: '',
        courseInstructors: '',
        coursePicture: null,
        courseDuration: '',
        courseStartDate: '',
        courseEndDate: '',
        courseDateTime: '',
        courseAssessmentDateTime: '',
        courseIsPaid: false,
        courseCost: '',
        courseDiscount: '',
        courseType: true, // Default to Online (boolean),
        courseHasExam: false,
        tags: [],


    });
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const [filterType, setFilterType] = useState('');
    const [filterPaid, setFilterPaid] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [attachmentCourseId, setAttachmentCourseId] = useState(null);
    const handleAttachments = (courseID) => {
        setAttachmentCourseId(courseID);
        setIsAttachmentModalOpen(true);
    };

    // Fetch courses and categories
    const fetchCourses = useCallback(async () => {
        try {
            const response = await api.get(`/Course/User/${userId}`);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }, [userId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/CourseCategory');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const validateFields = () => {
        const newErrors = {};

        if (!courseData.courseName.trim()) newErrors.courseName = 'Course name is required.';
        if (!courseData.courseCategoryID) newErrors.courseCategoryID = 'Course category is required.';
        if (!courseData.courseDescription.trim()) newErrors.courseDescription = 'Description is required.';
        if (!courseData.courseInstructors.trim()) newErrors.courseInstructors = 'Instructors are required.';
        if (courseData.courseIsPaid && (!courseData.courseCost || isNaN(courseData.courseCost))) {
            newErrors.courseCost = 'Course cost is required and must be a number for paid courses.';
        }
        if (courseData.courseDiscount && isNaN(courseData.courseDiscount)) newErrors.courseDiscount = 'Discount must be a number.';
        if (!courseData.courseStartDate) newErrors.courseStartDate = 'Start date is required.';
        if (!courseData.courseEndDate) newErrors.courseEndDate = 'End date is required.';
        if (courseData.courseHasExam && !courseData.courseAssessmentDateTime) {
            newErrors.examCourseDate = 'Exam date is required if the course has an exam.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCourseSubmit = async () => {
        if (!validateFields()) return;

        const formData = new FormData();
        formData.append("courseName", courseData.courseName);
        formData.append("courseCategoryID", courseData.courseCategoryID);
        formData.append("courseDescription", courseData.courseDescription);
        formData.append("courseInstructors", courseData.courseInstructors);
        formData.append("courseDuration", courseData.courseDuration);
        formData.append("courseStartDate", courseData.courseStartDate);
        formData.append("courseEndDate", courseData.courseEndDate);
        formData.append("courseHasExam", courseData.courseHasExam);
        if (courseData.courseHasExam) {
            const utcDateTime = new Date(courseData.courseAssessmentDateTime).toISOString(); // Convert to UTC
            formData.append("courseAssessmentDateTime", utcDateTime);
        }
        formData.append("courseIsPaid", courseData.courseIsPaid);
        formData.append("courseCost", courseData.courseCost);
        formData.append("courseDiscount", courseData.courseDiscount);
        formData.append("courseType", courseData.courseType);
        formData.append("UserID", userId);

        if (courseData.coursePicture) {
            formData.append('coursePicture', courseData.coursePicture);
        }
        try {
            let courseId;
            if (selectedCourse) {
                await api.put(`/Course/${selectedCourse.courseID}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setAlertMessage('Course updated successfully!');
                courseId = selectedCourse.courseID;
            } else {
                const response = await api.post('/Course', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setAlertMessage('Course added successfully!');
                courseId = response.data.courseID;
            }
            // Delete existing tags and add new ones
            await deleteAllTagsForCourse(courseId);
            if (courseData.tags.length > 0) {
                await addAllTagsForCourse(courseId, courseData.tags);
            }

            setAlertType('success');
            fetchCourses();
            setShowCourseModal(false);
        } catch (error) {
            console.error('Error saving course:', error);
            setAlertMessage('An error occurred while saving the course.');
            setAlertType('danger');
        }
    };

    const handleDeleteCourse = async (courseID) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/Course/${courseID}`);
                setAlertMessage('Course deleted successfully!');
                setAlertType('success');
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
                setAlertMessage('An error occurred while deleting the course.');
                setAlertType('danger');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Are you sure you want to delete the selected courses?')) {
            try {
                await Promise.all(
                    selectedCourses.map((courseID) => api.delete(`/Course/${courseID}`))
                );
                setAlertMessage('Selected courses deleted successfully!');
                setAlertType('success');
                setSelectedCourses([]);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting selected courses:', error);
                setAlertMessage('An error occurred while deleting selected courses.');
                setAlertType('danger');
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedCourses = React.useMemo(() => {
        let sortableCourses = [...courses];
        if (sortConfig.key) {
            sortableCourses.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableCourses;
    }, [courses, sortConfig]);

    const filteredCourses = sortedCourses.filter((course) => {
        return (
            course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterType === '' || course.courseType === (filterType === 'true')) &&
            (filterPaid === '' || course.courseIsPaid === (filterPaid === 'true'))
        );
    });

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course);

        const formattedAssessmentDateTime = course.courseAssessmentDateTime
            ? new Date(course.courseAssessmentDateTime).toISOString().slice(0, 16)
            : '';
        setCourseData({
            courseName: course.courseName || '',
            courseCategoryID: course.courseCategoryID || '',
            courseDescription: course.courseDescription || '',
            courseInstructors: course.courseInstructors || '',
            coursePicture: null, // Assume no change in picture
            courseDuration: course.courseDuration || '', // Default to empty
            courseStartDate: course.courseStartDate || '',
            courseEndDate: course.courseEndDate || '',
            courseDateTime: course.courseDateTime || '',
            courseAssessmentDateTime: formattedAssessmentDateTime,
            courseIsPaid: course.courseIsPaid || false,
            courseCost: course.courseCost || '',
            courseDiscount: course.courseDiscount || '',
            courseType: course.courseType || true,
            courseHasExam: course.courseHasExam || false,
            tags: [], // Temporarily empty until fetched

        });
        fetchTagsForCourse(course.courseID); // Fetch tags

        setErrors({});
        setShowCourseModal(true);

    };

    const handleAddCourse = () => {
        setSelectedCourse(null);
        setCourseData({
            courseName: '',
            courseCategoryID: '',
            courseDescription: '',
            courseInstructors: '',
            coursePicture: null,
            courseDuration: '',
            courseStartDate: '',
            courseEndDate: '',
            courseDateTime: '',
            courseAssessmentDateTime: '',
            courseIsPaid: false,
            courseCost: '',
            courseDiscount: '',
            courseType: true,
            courseHasExam: false,
            tags: [],
        });
        setErrors({});
        setShowCourseModal(true);
    };

    const handleFileChange = (e) => {
        setCourseData({ ...courseData, coursePicture: e.target.files[0] });
    };

    const handleSelectCourse = (courseID) => {
        setSelectedCourses((prev) =>
            prev.includes(courseID) ? prev.filter((id) => id !== courseID) : [...prev, courseID]
        );
    };

    const handleManageSessions = (courseID) => {
        navigate(`/CourseMgn/${courseID}`); // Use navigate here
    };
    const handleExam = (courseID) => {
        navigate(`/ExamMgn/${courseID}`); // Use navigate here
    };


    const fetchTagsForCourse = async (courseID) => {
        try {
            const response = await api.get(`/Tag/entity`, {
                params: { entityId: courseID, entityType: "Course" },
            });
            setCourseData((prevData) => ({
                ...prevData,
                tags: response.data.map((tag) => tag.tagName),
            }));
        } catch (error) {
            console.error("Error fetching tags for course:", error);
        }
    };

    const deleteAllTagsForCourse = async (courseID) => {
        try {
            // Fetch all tags associated with the course
            const response = await api.get(`/Tag/entity`, {
                params: { entityId: courseID, entityType: "Course" },
            });

            const tags = response.data;

            // Delete each tag from the course
            await Promise.all(
                tags.map(async (tag) => {
                    await api.delete(`/Tag/${tag.tagID}/entity`, {
                        params: { entityId: courseID, entityType: "Course" },
                    });

                    // Check if the tag is used elsewhere
                    const usageResponse = await api.get(`/Tag/entity`, {
                        params: { entityId: tag.tagID, entityType: "Course" },
                    });

                    // If not used, delete from the Tag table
                    if (!usageResponse.data.length) {
                        await api.delete(`/Tag/${tag.tagID}`);
                    }
                })
            );

            console.log(`Successfully deleted all tags for course ID: ${courseID}`);
        } catch (error) {
            console.error("Error deleting tags for course:", error);
        }
    };

    const addAllTagsForCourse = async (courseId, tags) => {
        try {
            const response = await api.post('/Tag/batch', tags);
            const tagData = response.data;

            for (const tag of tagData) {
                await api.post(`/Tag/${tag.tagID}/assign`, null, {
                    params: {
                        entityId: courseId,
                        entityType: "Course",
                    },
                });
            }
        } catch (error) {
            console.error("Error assigning tags:", error);
        }
    };
    return (
        <Layout>

            <Container className="mt-4">
                <h1 className="mb-4">Manage Courses</h1>

                {alertMessage && (
                    <Alert variant={alertType} onClose={() => setAlertMessage(null)} dismissible>
                        {alertMessage}
                    </Alert>
                )}

                <Row className="mb-3">
                    <Col>
                        <Button variant="primary" onClick={handleAddCourse}>
                            <FaPlus /> Add Course
                        </Button>
                        {selectedCourses.length > 0 && (
                            <Button variant="danger" className="ms-3" onClick={handleBulkDelete}>
                                <FaTrash /> Delete Selected
                            </Button>
                        )}
                    </Col>
                    <Col md="auto">
                        <Form.Control
                            type="text"
                            placeholder="Search Courses"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md="auto">
                        <Form.Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="true">Online</option>
                            <option value="false">Recorded</option>
                        </Form.Select>
                    </Col>
                    <Col md="auto">
                        <Form.Select
                            value={filterPaid}
                            onChange={(e) => setFilterPaid(e.target.value)}
                        >
                            <option value="">All Payment Types</option>
                            <option value="true">Paid</option>
                            <option value="false">Free</option>
                        </Form.Select>
                    </Col>
                    <Col md="auto">
                        <Form.Select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                            <option value={5}>5 Rows</option>
                            <option value={10}>10 Rows</option>
                            <option value={15}>15 Rows</option>
                        </Form.Select>
                    </Col>
                </Row>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Image</th>
                            <th onClick={() => handleSort('courseName')}>Name</th>
                            <th onClick={() => handleSort('courseCategoryID')}>Category</th>
                            <th onClick={() => handleSort('courseDescription')}>Description</th>
                            <th onClick={() => handleSort('courseType')}>Type</th>
                            <th onClick={() => handleSort('courseIsPaid')}>Paid</th>
                            <th onClick={() => handleSort('courseInstructors')}>Instructors</th>
                            <th onClick={() => handleSort('courseDuration')}>Duration</th>
                            <th onClick={() => handleSort('courseStartDate')}>Start Date</th>
                            <th onClick={() => handleSort('courseEndDate')}>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCourses.map((course) => (
                            <tr key={course.courseID}>
                                <td>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedCourses.includes(course.courseID)}
                                        onChange={() => handleSelectCourse(course.courseID)}
                                    />
                                </td>
                                <td>
                                    <img
                                        src={course.coursePicture ? config.BaseUrl + course.coursePicture : noImageCourse}
                                        alt={course.courseName}
                                        style={{ width: '100px', height: 'auto' }}
                                    />
                                </td>
                                <td>{course.courseName}</td>
                                <td>
                                    {categories.find(
                                        (c) => c.courseCategoryID === course.courseCategoryID
                                    )?.courseCategoryName || 'N/A'}
                                </td>
                                <td>{course.courseDescription}</td>
                                <td>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {course.courseType ? 'Online' : 'Recorded'}
                                            </Tooltip>
                                        }
                                    >
                                        {course.courseType ? (
                                            <FaWifi color="green" />
                                        ) : (
                                            <FaVideo color="blue" />
                                        )}
                                    </OverlayTrigger>
                                </td>
                                <td>
                                    {course.courseIsPaid && (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>Paid Course</Tooltip>}
                                        >
                                            <FaDollarSign color="gold" />
                                        </OverlayTrigger>
                                    )}
                                </td>
                                <td>{course.courseInstructors}</td>
                                <td>{course.courseDuration}</td>
                                <td>{course.courseStartDate}</td>
                                <td>{course.courseEndDate}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        className="me-2"
                                        onClick={() => handleEditCourse(course)}
                                    >
                                        <FaEdit /> Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="me-2"
                                        onClick={() => handleDeleteCourse(course.courseID)}
                                    >
                                        <FaTrash /> Delete
                                    </Button>
                                    <Button variant="info" className="me-2" onClick={() => handleManageSessions(course.courseID)}>
                                        Manage Sessions
                                    </Button>
                                    {course.courseHasExam === true && (
                                        <Button variant="success" className="me-2" onClick={() => handleExam(course.courseID)}>
                                            Exam
                                        </Button>
                                    )}

                                    <Button
                                        variant="secondary"
                                        className="me-2"
                                        onClick={() => handleAttachments(course.courseID)}
                                    >
                                        Attachments
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Pagination>
                    {[...Array(totalPages).keys()].map((number) => (
                        <Pagination.Item
                            key={number + 1}
                            active={number + 1 === currentPage}
                            onClick={() => handlePageChange(number + 1)}
                        >
                            {number + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>

                <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedCourse ? 'Edit Course' : 'Add Course'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="danger">
                                {Object.values(errors).map((err, index) => (
                                    <p key={index}>{err}</p>
                                ))}
                            </Alert>
                        )}
                        <Form>
                            <Form.Group>
                                <Form.Label>Course Name</Form.Label>
                                <Form.Control
                                    value={courseData.courseName}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, courseName: e.target.value })
                                    }
                                    isInvalid={!!errors.courseName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseName}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Course Category</Form.Label>
                                <Form.Select
                                    value={courseData.courseCategoryID}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            courseCategoryID: e.target.value,
                                        })
                                    }
                                    isInvalid={!!errors.courseCategoryID}
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.courseCategoryID}
                                            value={category.courseCategoryID}
                                        >
                                            {category.courseCategoryName}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseCategoryID}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Course Type</Form.Label>
                                <Form.Select
                                    value={courseData.courseType}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            courseType: e.target.value === 'true',
                                        })
                                    }
                                >
                                    <option value="true">Online</option>
                                    <option value="false">Recorded</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Tags</Form.Label>
                                <TagComponent
                                    key={JSON.stringify(courseData.tags)} // Forces re-render when tags change
                                    initialTags={courseData.tags}
                                    suggestionsApi="/api/Tag"
                                    onTagsChange={(updatedTags) =>
                                        setCourseData({ ...courseData, tags: updatedTags })
                                    }
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Course Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={courseData.courseDescription}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            courseDescription: e.target.value,
                                        })
                                    }
                                    isInvalid={!!errors.courseDescription}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseDescription}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Duration (HH:mm:ss)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="HH:mm:ss"
                                    value={courseData.courseDuration || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setCourseData({ ...courseData, courseDuration: value });
                                    }}
                                />

                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Course Instructors</Form.Label>
                                <Form.Control
                                    value={courseData.courseInstructors}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            courseInstructors: e.target.value,
                                        })
                                    }
                                    isInvalid={!!errors.courseInstructors}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseInstructors}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Course Picture</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Does this course have an exam?</Form.Label>
                                <Form.Select
                                    value={courseData.courseHasExam.toString()} // Convert boolean to string
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            courseHasExam: e.target.value === 'true', // Convert string back to boolean
                                        })
                                    }
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </Form.Select>
                            </Form.Group>
                            {courseData.courseHasExam && (
                                <Form.Group>
                                    <Form.Label>Course Exam Date and Time</Form.Label>
                                    <Form.Control
                                        type="datetime-local"

                                        value={courseData.courseAssessmentDateTime}
                                        onChange={(e) => {
                                            const localDateTime = e.target.value; // Validate input format
                                            if (localDateTime) {
                                                setCourseData({
                                                    ...courseData,
                                                    courseAssessmentDateTime: localDateTime,
                                                });
                                            }

                                        }}
                                        isInvalid={!!errors.courseAssessmentDateTime}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.courseAssessmentDateTime}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}




                            <Form.Group>
                                <Form.Label>Is Course Paid?</Form.Label>
                                <Form.Select
                                    value={courseData.courseIsPaid}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            courseIsPaid: e.target.value === 'true',
                                        })
                                    }
                                >
                                    <option value="false">Free</option>
                                    <option value="true">Paid</option>
                                </Form.Select>
                            </Form.Group>

                            {courseData.courseIsPaid && (
                                <Form.Group>
                                    <Form.Label>Course Cost</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={courseData.courseCost}
                                        onChange={(e) =>
                                            setCourseData({ ...courseData, courseCost: e.target.value })
                                        }
                                        isInvalid={!!errors.courseCost}
                                        disabled={!courseData.courseIsPaid}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.courseCost}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}
                            {courseData.courseIsPaid && (
                                <Form.Group>
                                    <Form.Label>Course Discount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={courseData.courseDiscount}
                                        onChange={(e) =>
                                            setCourseData({
                                                ...courseData,
                                                courseDiscount: e.target.value,
                                            })
                                        }
                                        disabled={!courseData.courseIsPaid}
                                    />
                                </Form.Group>
                            )}
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={courseData.courseStartDate}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, courseStartDate: e.target.value })
                                    }
                                    isInvalid={!!errors.courseStartDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseStartDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={courseData.courseEndDate}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, courseEndDate: e.target.value })
                                    }
                                    isInvalid={!!errors.courseEndDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseEndDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleCourseSubmit}>
                            Save Course
                        </Button>
                    </Modal.Footer>
                </Modal>

                {isAttachmentModalOpen && (
                    <AttachmentModal
                        entityType="course"
                        entityId={attachmentCourseId}
                        show={isAttachmentModalOpen}
                        onClose={() => setIsAttachmentModalOpen(false)}
                    />
                )}
            </Container>
        </Layout>

    );
};

export default CoursePage;
