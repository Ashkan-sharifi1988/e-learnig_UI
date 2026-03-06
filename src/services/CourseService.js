import api from "../api/api";

export const fetchCoursesWithStats = async (userId) => {
    try {
        const response = await api.get(`/Course/GetCoursesWithStats`, {
            params: { userId },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};