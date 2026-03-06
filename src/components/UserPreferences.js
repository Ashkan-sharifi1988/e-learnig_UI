import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import api from "../api/api";
import '../assets/PreferencesModal.css';

const PreferencesModal = ({ userId }) => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);

    // State for various sections
    const [learningGoals, setLearningGoals] = useState([]);
    const [selectedGoals, setSelectedGoals] = useState([]);
    const [timeOfDayOptions, setTimeOfDayOptions] = useState([
        "Morning", "Noon", "Afternoon", "Evening", "Night",
    ]);
    const [selectedTimeOfDay, setSelectedTimeOfDay] = useState([]);
    const [deviceOptions, setDeviceOptions] = useState(["Laptop", "Mobile", "Tablet"]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [onlineCourse, setOnlineCourse] = useState(false);
    const [offlineCourse, setOfflineCourse] = useState(false);
    const [courseCategories, setCourseCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [requiresAssessment, setRequiresAssessment] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const profileResponse = await api.get(`/profile/${userId}`);
                const hasPreference = profileResponse.data.hasPreference ?? false;
        
                // Always show modal if no preferences set
                if (!hasPreference) {
                    setShow(true);
        
                    // Fetch learning goals
                    const goalsResponse = await api.get('/LearningGoal');
                    setLearningGoals(goalsResponse.data);
        
                    // Fetch user-selected goals
                    const userGoalsResponse = await api.get(`/LearningGoal/user/${userId}`);
                    setSelectedGoals(userGoalsResponse.data.map((goal) => goal.learningGoalID));
        
                    // Fetch course categories
                    const categoriesResponse = await api.get('/CourseCategory');
                    setCourseCategories(categoriesResponse.data);
        
                    // Fetch user preferences
                    const preferencesResponse = await api.get(`/userPreferences/${userId}`);
                    const preferences = preferencesResponse.data || {};
        
                    // Update state based on fetched preferences
                    setSelectedTimeOfDay(preferences.timeOfDay || []); // Use array directly
                    setSelectedDevices(preferences.devices || []); // Use array directly
                    setOnlineCourse(preferences.onlineCourse || false);
                    setOfflineCourse(preferences.offlineCourse || false);
                    setRequiresAssessment(preferences.requiresAssessment || false);
                    setSelectedCategories(preferences.courseCategories || []); // Use array directly
                }
            } catch (error) {
                console.error('Error fetching preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [userId]);

    const handleSelection = (item, selectedItems, setSelectedItems) => {
        setSelectedItems((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const handleSubmit = async () => {
        try {
            await api.put(`/LearningGoal/user/batch`, {
                userID: userId,
                learningGoalIDs: selectedGoals,
            });

            await api.post('/userPreferences', {
                userID: userId,  // Note: Changed to match the DTO property name (userID not userId)
                timeOfDay: selectedTimeOfDay,  // Send array directly
                devices: selectedDevices,      // Send array directly
                onlineCourse,
                offlineCourse,
                requiresAssessment,
                courseCategories: selectedCategories  // Send array directly
            });

            await api.put(`/User/${userId}/preference`, true);

            setShow(false);
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

 //   if (loading) return <Spinner animation="border" />;

    return (
        <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Set Your Preferences</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <h5>Learning Goals</h5>
                    <div className="grid-container">
                        {learningGoals.map((goal) => (
                            <div
                                key={goal.learningGoalID}
                                className={`grid-item ${
                                    selectedGoals.includes(goal.learningGoalID) ? 'selected' : ''
                                }`}
                                onClick={() =>
                                    handleSelection(goal.learningGoalID, selectedGoals, setSelectedGoals)
                                }
                            >
                                {goal.goalTitle}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h5>Preferred Study Time</h5>
                    <div className="grid-container">
                        {timeOfDayOptions.map((time) => (
                            <div
                                key={time}
                                className={`grid-item ${
                                    selectedTimeOfDay.includes(time) ? 'selected' : ''
                                }`}
                                onClick={() =>
                                    handleSelection(time, selectedTimeOfDay, setSelectedTimeOfDay)
                                }
                            >
                                {time}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h5>Devices</h5>
                    <div className="grid-container">
                        {deviceOptions.map((device) => (
                            <div
                                key={device}
                                className={`grid-item ${
                                    selectedDevices.includes(device) ? 'selected' : ''
                                }`}
                                onClick={() =>
                                    handleSelection(device, selectedDevices, setSelectedDevices)
                                }
                            >
                                {device}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h5>Course Type</h5>
                    <div className="grid-container">
                        <div
                            className={`grid-item ${onlineCourse ? 'selected' : ''}`}
                            onClick={() => setOnlineCourse(!onlineCourse)}
                        >
                            Online
                        </div>
                        <div
                            className={`grid-item ${offlineCourse ? 'selected' : ''}`}
                            onClick={() => setOfflineCourse(!offlineCourse)}
                        >
                            Offline
                        </div>
                    </div>
                </div>
                <div>
                    <h5>Requires Assessment</h5>
                    <div className="grid-container">
                        <div
                            className={`grid-item ${requiresAssessment ? 'selected' : ''}`}
                            onClick={() => setRequiresAssessment(!requiresAssessment)}
                        >
                            Yes
                        </div>
                    </div>
                </div>
                <div>
                    <h5>Course Categories</h5>
                    <div className="grid-container">
                        {courseCategories.map((category) => (
                            <div
                                key={category.courseCategoryID}
                                className={`grid-item ${
                                    selectedCategories.includes(category.courseCategoryID)
                                        ? 'selected'
                                        : ''
                                }`}
                                onClick={() =>
                                    handleSelection(category.courseCategoryID, selectedCategories, setSelectedCategories)
                                }
                            >
                                {category.courseCategoryName}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Preferences
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PreferencesModal;
