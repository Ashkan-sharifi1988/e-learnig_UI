import React, { useState } from 'react';
import api from '../api/api';
import '../assets/Tag.css'; // Assuming the uploaded CSS for styling

const Tag = ({ initialTags = [], onTagsChange }) => {
    const [tags, setTags] = useState(initialTags);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fixed API endpoint for tag suggestions
    const SUGGESTIONS_API = '/Tag/search';

    // Handle input change and fetch suggestions
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.trim().length > 1) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
        }
    };

    // Fetch suggestions from the API
    const fetchSuggestions = async (query) => {
        setIsLoading(true);
        try {
            const response = await api.get(`${SUGGESTIONS_API}?query=${query}`);
            setSuggestions(response.data); // Assuming response is JSON with data array
        } catch (error) {
            console.error('Error fetching tag suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add a tag
    const addTag = (tagName) => {
        if (!tags.includes(tagName)) {
            const updatedTags = [...tags, tagName];
            setTags(updatedTags);
            onTagsChange(updatedTags);
        }
        setInputValue('');
        setSuggestions([]);
    };

    // Remove a tag
    const removeTag = (tagName) => {
        const updatedTags = tags.filter((tag) => tag !== tagName);
        setTags(updatedTags);
        onTagsChange(updatedTags);
    };

    // Handle key press for adding tags
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue) {
                addTag(trimmedValue);
            }
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        addTag(suggestion.tagName);
    };

    return (
        <div className="tag-component">
            <div className="tags-container">
                {tags.map((tag, index) => (
                    <div key={index} className="tag-box">
                        {tag}
                        <button
                            type="button"
                            className="tag-remove-btn"
                            onClick={() => removeTag(tag)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    className="tag-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type and press Enter..."
                />
            </div>
            {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {isLoading ? (
                        <div className="suggestion-item">Loading...</div>
                    ) : (
                        suggestions.map((suggestion) => (
                            <div
                                key={suggestion.tagID}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.tagName}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Tag;
