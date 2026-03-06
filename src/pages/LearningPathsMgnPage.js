import React, { useEffect, useState, useContext, useCallback } from "react";
import { Button, Table, Modal, Form, Spinner, Image } from "react-bootstrap";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import config from "../config";
import noImageCourse from '../assets/Images/No-Image-Course.png';
import Layout from '../components/Layout';
import TagComponent from '../components/Tag';
import GoalsInputComponent from "../components/GoalsInputComponent";

const LearningPathsMgnPage = () => {
    const { userId } = useContext(AuthContext); // Get tutorId from AuthContext
    const [learningPaths, setLearningPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPathModal, setShowPathModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false); // For course selection
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [currentPath, setCurrentPath] = useState(null); // For editing
    const [formData, setFormData] = useState({
        learningPathID: null,
        learningPathName: "",
        description: "",
        imageUrl: "",
        courses: [],
        tags: [],
        goals: [],
    });
    const [imageFile, setImageFile] = useState(null); // For storing the selected image file
    const [previewImage, setPreviewImage] = useState(""); // For previewing the selected image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setPreviewImage(file ? URL.createObjectURL(file) : "");
    };
    // Fetch Learning Paths created by the tutor
    const fetchLearningPaths = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/LearningPath/tutor/${userId}`);
            setLearningPaths(response.data);
        } catch (error) {
            toast.error("Failed to fetch Learning Paths.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch all courses
    const fetchCourses = async () => {
        try {
            const response = await api.get(`/Course/User/${userId}`);
            setCourses(response.data);
        } catch (error) {
            toast.error("Failed to fetch courses.");
        }
    };

    // Fetch Tags for Learning Path
    const fetchTagsForLearningPath = async (learningPathID) => {
        try {
            const response = await api.get(`/Tag/entity`, {
                params: { entityId: learningPathID, entityType: 'LearningPath' },
            });
            setFormData((prevData) => ({
                ...prevData,
                tags: response.data.map((tag) => tag.tagName),
            }));
        } catch (error) {
            console.error('Error fetching tags for learning path:', error);
        }
    };


    // Delete All Tags for Learning Path
    const deleteAllTagsForLearningPath = async (learningPathID) => {
        try {
            const response = await api.get(`/Tag/entity`, {
                params: { entityId: learningPathID, entityType: 'LearningPath' },
            });
            const tags = response.data;

            await Promise.all(
                tags.map(async (tag) => {
                    await api.delete(`/Tag/${tag.tagID}/entity`, {
                        params: { entityId: learningPathID, entityType: 'LearningPath' },
                    });

                    const usageResponse = await api.get(`/Tag/entity`, {
                        params: { entityId: tag.tagID, entityType: 'LearningPath' },
                    });

                    if (!usageResponse.data.length) {
                        await api.delete(`/Tag/${tag.tagID}`);
                    }
                })
            );

            console.log(`Successfully deleted all tags for Learning Path ID: ${learningPathID}`);
        } catch (error) {
            console.error('Error deleting tags for learning path:', error);
        }
    };

    // Add Tags for Learning Path
    const addAllTagsForLearningPath = async (learningPathID, tags) => {
        try {
            const response = await api.post('/Tag/batch', tags);
            const tagData = response.data;

            for (const tag of tagData) {
                await api.post(`/Tag/${tag.tagID}/assign`, null, {
                    params: {
                        entityId: learningPathID,
                        entityType: 'LearningPath',
                    },
                });
            }
        } catch (error) {
            console.error('Error assigning tags:', error);
        }
    };

    const fetchGoalsForLearningPath = async (learningPathID) => {
        try {
            const response = await api.get(`/LearningGoal/learningPath/${learningPathID}`);
         
            setFormData(prevData => ({
                ...prevData,
                goals: response.data.map(goal => ({
                    goalID: goal.learningGoalID,
                    goalTitle: goal.learningGoal.goalTitle
                }))
            }));
        } catch (error) {
            console.error('Error fetching goals for learning path:', error);
            toast.error('Failed to fetch learning goals.');
        }
    };

    // Delete All Goals for Learning Path
    const deleteAllGoalsForLearningPath = async (learningPathID) => {
        try {
            const response = await api.delete(`/LearningGoal/LearnigPathGoal/DeleteAll/${learningPathID}`);
            if (response.status === 204) {
              //  toast.success("All goals for the learning path were successfully deleted.");
            } else {
                toast.error("Failed to delete all goals for the learning path.");
            }
        } catch (error) {
            console.error("Error deleting all goals for the learning path:", error);
            toast.error("Error deleting all goals for the learning pat");
           }
    };

    const addAllGoalsForLearningPath = async (learningPathID, goals) => {
        if (goals.length>0) {
        try {
            // Step 1: Add all goals to the `LearningGoal` model
            let createdGoals = [];
            try {
                const response = await api.post(
                    "/LearningGoal/batch",
                    goals.map((goal) => ({
                        goalTitle: goal.goalTitle,
                    }))
                );
                createdGoals = response.data;
            } catch (error) {
                console.error("Error creating learning goals:", error);
                throw new Error("Failed to create learning goals.");
            }

            // Step 2: Prepare payload for associating goals with the Learning Path
            const payload = createdGoals.map((goal) => ({
                learningPathID,
                learningGoalID: goal.learningGoalID, // Use IDs from created goals
            }));

            // Step 3: Associate all created goals with the Learning Path
            const response = await api.post("/LearningGoal/learningPathGoal/batch", payload);

            if (response.status === 200) {
                console.log("Learning Path Goals added successfully.");
            } else {
                console.error("Unexpected response:", response);
                throw new Error("Failed to associate goals with the Learning Path.");
            }
        } catch (error) {
            console.error("Error adding goals to Learning Path:", error);
            throw new Error("Failed to add goals to Learning Path.");
        }
    }
    };

    const handleShowCourseModal = () => {
        fetchCourses();
        setShowCourseModal(true);
    };

    const handleSelectCourse = (course) => {
        if (!selectedCourses.find((selected) => selected.courseID === course.courseID)) {
            setSelectedCourses([...selectedCourses, { ...course, sequence: selectedCourses.length + 1 }]);
        } else {
            setSelectedCourses(selectedCourses.filter((selected) => selected.courseID !== course.courseID));
        }
    };

    const handleApplyCourses = () => {
        const updatedCourses = selectedCourses.map((course, index) => ({
            courseID: course.courseID,
            sequence: index + 1,
        }));
        setFormData({ ...formData, courses: updatedCourses });
        setShowCourseModal(false);
    };

    const handleShowPathModal = async (path = null) => {
        if (!courses.length) {
            await fetchCourses(); // Fetch courses if not already loaded
        }
    
        if (path) {
            setCurrentPath(path);
            setFormData({
                learningPathName: path.learningPathName || "",
                description: path.description || "",
                imageUrl: path.imageUrl || "",
                tags: [], // Tags will be fetched asynchronously
                courses: path.courses.map((course) => ({
                    ...course,
                })),
                goals: [], // Goals will be fetched asynchronously
            });
            setSelectedCourses(
                path.courses.map((course) => ({
                    ...course,
                }))
            );
            setPreviewImage(path.imageUrl ? config.BaseUrl + path.imageUrl : "");
            fetchTagsForLearningPath(path.learningPathID);
            fetchGoalsForLearningPath(path.learningPathID);
        } else {
            // Reset form for new path
            setCurrentPath(null);
            setFormData({
                learningPathName: "",
                description: "",
                imageUrl: "",
                tags: [],
                courses: [],
                goals: [],
            });
            setSelectedCourses([]);
            setPreviewImage("");
        }
        setImageFile(null);
        setShowPathModal(true);
    };

    const handleClosePathModal = () => {
        setShowPathModal(false);
        setCurrentPath(null);
    };

    const handleDeleteCourse = (courseID) => {
        const updatedCourses = formData.courses.filter((course) => course.courseID !== courseID);
        setFormData({ ...formData, courses: updatedCourses });
    };

    const handleReorderCourse = (index, direction) => {
        const updatedCourses = [...formData.courses];
        const swapIndex = direction === "up" ? index - 1 : index + 1;

        // Swap courses
        if (swapIndex >= 0 && swapIndex < updatedCourses.length) {
            const temp = updatedCourses[index];
            updatedCourses[index] = updatedCourses[swapIndex];
            updatedCourses[swapIndex] = temp;
        }

        // Update sequences
        updatedCourses.forEach((course, i) => (course.sequence = i + 1));
        setFormData({ ...formData, courses: updatedCourses });
    };

    const handleSubmit = async () => {
        try {
            if (formData.courses.length === 0) {
                toast.error("A Learning Path must have at least one course.");
                return;
            }

            // Create FormData for multipart/form-data submission
            const data = new FormData();

            // Append required fields
            data.append("LearningPathName", formData.learningPathName);
            data.append("Description", formData.description);

            // Append image file if selected
            if (imageFile) {
                data.append("ImageUrl", imageFile);
            }

            // Append courses as JSON string
            data.append("Courses", JSON.stringify(formData.courses));

            // Append tags as JSON string
            if (formData.tags.length > 0) {
                data.append("Tags", JSON.stringify(formData.tags));
            }

            // Append goals as JSON string
            if (formData.goals.length > 0) {
                data.append("Goals", JSON.stringify(formData.goals.map(goal => ({
                    goalID: goal.goalID || null,
                    goalTitle: goal.goalTitle
                }))));
            }
            let learningPathID;

            if (currentPath && currentPath.learningPathID) {
                // Update existing Learning Path
                await api.put(`/LearningPath/${currentPath.learningPathID}`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                learningPathID = currentPath.learningPathID;

                // Update tags for the Learning Path
                await deleteAllTagsForLearningPath(learningPathID);
                await addAllTagsForLearningPath(learningPathID, formData.tags);

                // Update goals for the Learning Path
                await deleteAllGoalsForLearningPath(learningPathID);
                await addAllGoalsForLearningPath(learningPathID, formData.goals);

                toast.success("Learning Path updated successfully.");
            } else {
                // Create a new Learning Path
                const response = await api.post(`/LearningPath?tutorId=${userId}`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                learningPathID = response.data.learningPathID;

                // Add tags to the newly created Learning Path
                if (formData.tags.length > 0) {
                    await addAllTagsForLearningPath(learningPathID, formData.tags);
                }

                // Add goals to the newly created Learning Path
                if (formData.goals.length > 0) {
                    await addAllGoalsForLearningPath(learningPathID, formData.goals);
                }

                toast.success("Learning Path created successfully.");
            }

            // Refresh the Learning Path list and close the modal
            fetchLearningPaths();
            handleClosePathModal();
        } catch (error) {
            if (error.response && error.response.status === 415) {
                toast.error("Unsupported Media Type. Ensure the request uses multipart/form-data.");
            } else if (error.response && error.response.status === 400) {
                toast.error("Validation error. Please check the input fields.");
            } else {
                toast.error("An unexpected error occurred.");
            }
            console.error("Error in handleSubmit:", error.response || error);
        }
    };





    const handleDelete = async (id) => {
        if (!id) {
            console.error("Error: Missing learningPathID");
            toast.error("Unable to delete Learning Path. ID is missing.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this Learning Path?")) {
            try {
                await api.delete(`/LearningPath/${id}`);
                await deleteAllTagsForLearningPath(id);
                await deleteAllGoalsForLearningPath(id);
                toast.success("Learning Path deleted successfully.");

                // Update the state to remove the deleted path
                setLearningPaths((prevPaths) => prevPaths.filter((path) => path.learningPathID !== id));
            } catch (error) {
                console.error("Error deleting Learning Path:", error);
                toast.error("Failed to delete Learning Path.");
            }
        }
    };


    useEffect(() => {
        fetchLearningPaths();
    }, [fetchLearningPaths]);
    return (
        <Layout>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Manage Learning Paths</h2>
                    <Button variant="primary" onClick={() => handleShowPathModal()}>
                        + Create Learning Path
                    </Button>
                </div>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : learningPaths.length === 0 ? ( // Check if there are no learning paths
                    <div className="text-center mt-4">
                        <p>No Learning Paths available for this tutor.</p>
                    </div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Courses</th>

                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {learningPaths.map((path) => (
                                <tr key={path.learningPathID}>
                                    <td>{path.learningPathName}</td>
                                    <td>{path.description}</td>
                                    <td>{path.courses
    .map((course) => courses.find((c) => c.courseID === course.courseID)?.courseName)
    .filter((name) => name) // Filter out null or undefined names
    .join(", ")}</td>
                                   

                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowPathModal(path)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(path.learningPathID)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {/* Modal for Learning Path */}
                <Modal show={showPathModal} onHide={handleClosePathModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{currentPath ? "Edit" : "Create"} Learning Path</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="learningPathName"
                                    value={formData.learningPathName}
                                    onChange={(e) => setFormData({ ...formData, learningPathName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                            <Form.Label>Goals</Form.Label>
                                <GoalsInputComponent
                                    initialGoals={formData.goals || []}
                                    onGoalsChange={(updatedGoals) => setFormData({ ...formData, goals: updatedGoals })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Image</Form.Label>
                                {previewImage && (
                                    <div className="mb-3">
                                        <Image
                                            src={previewImage}
                                            alt="Preview"
                                            thumbnail
                                            style={{ maxHeight: "150px" }}
                                        />
                                    </div>
                                )}
                                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                            </Form.Group>

                            <h5>Selected Courses</h5>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Sequence</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.courses.map((course, index) => (
                                        <tr key={course.courseID}>
                                            <td>{courses.find((c) => c.courseID === course.courseID)?.courseName || "Unknown"}</td>
                                            <td>{course.sequence}</td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDeleteCourse(course.courseID)}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleReorderCourse(index, "up")}
                                                    disabled={index === 0}
                                                    className="me-2"
                                                >
                                                    ↑
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleReorderCourse(index, "down")}
                                                    disabled={index === formData.courses.length - 1}
                                                >
                                                    ↓
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Button variant="outline-primary" onClick={handleShowCourseModal}>
                                Add New Course
                            </Button>
                            <Form.Group className="mb-3">
                                <Form.Label>Tags</Form.Label>
                                <TagComponent
                                    key={JSON.stringify(formData.tags)}
                                    initialTags={formData.tags}
                                    suggestionsApi="/api/Tag"
                                    onTagsChange={(updatedTags) =>
                                        setFormData({ ...formData, tags: updatedTags })
                                    }
                                />
                            </Form.Group>


                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClosePathModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal for Course Selection */}
                <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Courses</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Modal.Body>
                            <div
                                className="row"
                                style={{
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                    paddingRight: "10px", // Add padding to prevent cards from sticking to the scrollbar
                                }}
                            >
                                {courses.map((course) => (
                                    <div
                                        key={course.courseID}
                                        className="col-3 mb-3"
                                        style={{
                                            cursor: "pointer",
                                            padding: "5px", // Add padding around the course card
                                        }}
                                        onClick={() => handleSelectCourse(course)}
                                    >
                                        <div
                                            className="card"
                                            style={{
                                                border: selectedCourses.find((c) => c.courseID === course.courseID) ? "2px solid #007bff" : "1px solid #ddd",
                                                borderRadius: "5px",
                                                backgroundColor: selectedCourses.find((c) => c.courseID === course.courseID) ? "#f0f8ff" : "#fff",
                                            }}
                                        >
                                            <Image
                                                src={course.coursePicture ? config.BaseUrl + course.coursePicture : noImageCourse}
                                                alt={course.courseName}
                                                className="card-img-top"
                                                style={{ height: "100px", objectFit: "cover" }}
                                            />
                                            <div className="card-body text-center">
                                                <p className="card-text" style={{ fontSize: "0.9rem" }}>{course.courseName}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Modal.Body>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleApplyCourses}>
                            Apply
                        </Button>
                    </Modal.Footer>
                </Modal>
                <ToastContainer />
            </div>
        </Layout>
    );
};

export default LearningPathsMgnPage;
