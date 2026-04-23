import axios from "./axios";

export const notificationApi = {
    getNotifications: async () => {
        const response = await axios.get("/notifications");
        return response.data;
    },

    markAsRead: async (notificationId: string) => {
        const response = await axios.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axios.patch("/notifications/read-all");
        return response.data;
    },

    triggerTestNotification: async () => {
        const response = await axios.post("/notifications/test");
        return response.data;
    }
};
