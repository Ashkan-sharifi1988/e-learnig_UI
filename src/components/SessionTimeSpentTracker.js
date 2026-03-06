import React, { useEffect, useState } from "react";
import api from "../api/api";

const TimeSpentTracker = ({ userId, sessionId }) => {
  const [entryTime, setEntryTime] = useState(Date.now()); // Initialize entry time

  useEffect(() => {
    const updateTimeSpent = async () => {
      const exitTime = Date.now();
      const timeSpentMilliseconds = exitTime - entryTime;

      // Convert milliseconds to seconds
      const timeSpentSeconds = Math.floor(timeSpentMilliseconds / 1000);

      if (timeSpentSeconds <= 0) return; // Prevent invalid or unnecessary updates

      try {
        // Send the time spent to the backend
        await api.post("/SessionAttendance/UpdateTimeSpent", {
          userId,
          sessionId,
          timeSpentSeconds,
        });
        console.log("Time spent updated successfully:", timeSpentSeconds);
      } catch (error) {
        console.error("Error updating time spent:", error);
      }
    };

    // Trigger update when the user leaves the page or reloads
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      updateTimeSpent();
    };

    // Attach event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup to avoid duplicate calls
      updateTimeSpent();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [entryTime, userId, sessionId]);

  return null; // No visible UI
};

export default TimeSpentTracker;
