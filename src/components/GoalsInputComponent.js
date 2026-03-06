import React, { useState, useEffect } from "react";
import { Form, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import "../assets/GoalsInputComponent.css";
import api from "../api/api";

const GoalsInputComponent = ({ initialGoals = [], onGoalsChange }) => {
    const [goals, setGoals] = useState(initialGoals);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Update goals when initialGoals prop changes
    useEffect(() => {
        setGoals(initialGoals);
    }, [initialGoals]);

    // API endpoints
    const SUGGESTIONS_API = "/LearningGoals/search";

    // Fetch suggestions based on user input
    const fetchSuggestions = async (query) => {
        setIsLoading(true);
        try {
            const response = await api.get(SUGGESTIONS_API, { params: { query } });
            setSuggestions(response.data);
        } catch (error) {
            console.error("Error fetching goal suggestions:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Add a goal to the list locally
    const addGoalLocally = (goalTitle) => {
        if (goals.find((goal) => goal.goalTitle.toLowerCase() === goalTitle.toLowerCase())) {
            toast.info("Goal already added.");
            return;
        }

        const newGoal = { 
            goalID: null, 
            goalTitle: goalTitle.trim()
        };
        
        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        onGoalsChange(updatedGoals); // Notify parent about changes
        setInputValue(""); // Clear input field
        setSuggestions([]); // Clear suggestions
    };

    // Remove a goal from the list
    const removeGoal = (goalTitle) => {
        const updatedGoals = goals.filter((goal) => goal.goalTitle !== goalTitle);
        setGoals(updatedGoals);
        onGoalsChange(updatedGoals); // Notify parent
    };

    // Handle user input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.trim().length > 1) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
        }
    };

    // Handle key press for adding goals locally
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue) {
                addGoalLocally(trimmedValue);
            }
        }
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion) => {
        addGoalLocally(suggestion.goalTitle);
    };

    return (
        <div className="goals-input-container">
            <Form.Group className="goals-input-box">
                {goals.map((goal, index) => (
                    <span key={`${goal.goalTitle}-${index}`} className="goal-badge">
                        {goal.goalTitle}
                        <button
                            type="button"
                            className="remove-goal-btn"
                            onClick={() => removeGoal(goal.goalTitle)}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="goals-input-field"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={goals.length ? "" : "Type to add goals..."}
                />
            </Form.Group>

            {suggestions.length > 0 && (
                <Dropdown show className="goals-dropdown">
                    <Dropdown.Menu>
                        {isLoading ? (
                            <Dropdown.Item disabled>Loading...</Dropdown.Item>
                        ) : (
                            suggestions.map((suggestion) => (
                                <Dropdown.Item
                                    key={suggestion.goalID}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.goalTitle}
                                </Dropdown.Item>
                            ))
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </div>
    );
};

export default GoalsInputComponent;