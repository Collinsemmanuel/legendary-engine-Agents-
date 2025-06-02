import axios from 'axios';
import authService from './authService'; // For getting auth headers

const API_BASE_URL = '/api'; // Base URL for all API calls

// Function to get user profile
const getUserProfile = async () => {
  const headers = authService.getAuthHeaders();
  if (!headers.Authorization) {
    // Or handle this more gracefully, maybe by redirecting to login or returning a specific error
    return Promise.reject(new Error("No authorization token found. Please log in."));
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/profile/`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response || error);
    throw error.response?.data || error;
  }
};

// Function to update user profile
const updateUserProfile = async (profileData) => {
  const headers = authService.getAuthHeaders();
   if (!headers.Authorization) {
    return Promise.reject(new Error("No authorization token found. Please log in."));
  }
  try {
    // Using PUT to replace the entire profile data as per RetrieveUpdateAPIView default for PUT.
    // PATCH could be used for partial updates if backend supports it well.
    const response = await axios.put(`${API_BASE_URL}/profile/`, profileData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error.response || error);
    throw error.response?.data || error;
  }
};

// Placeholder for fetching full user details (User model + Profile model)
// This might be useful if /api/profile/ only returns UserProfile fields
const getCurrentUserDetails = async () => {
  const headers = authService.getAuthHeaders();
  if (!headers.Authorization) {
    return Promise.reject(new Error("No authorization token found."));
  }
  try {
    // Assuming an endpoint like /api/user/me/ that uses UserDetailsSerializer
    // This endpoint does not exist yet from previous tasks.
    // For now, ProfilePage will primarily use /api/profile/ and supplement with localStorage user info.
    // If backend's /api/profile/ view is changed to use UserDetailsSerializer for GET, this might not be needed.
    // const response = await axios.get(`${API_BASE_URL}/user/details/`, { headers });
    // return response.data;

    // Fallback: Get basic user from localStorage and profile from /api/profile/
    // This logic will be in the component itself.
    console.warn("getCurrentUserDetails is a placeholder. Full user details endpoint not yet defined.");
    return Promise.resolve(JSON.parse(localStorage.getItem('user'))); // Example, if user object is stored
  } catch (error) {
    console.error("Error fetching current user details:", error.response || error);
    throw error.response?.data || error;
  }
};


export default {
  getUserProfile,
  updateUserProfile,
  getCurrentUserDetails, // Placeholder

  getBuyerDashboardSummary: async () => {
    const headers = authService.getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.reject(new Error("No authorization token found."));
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/buyer/summary/`, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching buyer dashboard summary:", error.response || error);
      throw error.response?.data || error;
    }
  },

  getBuyerPurchases: async (page = 1) => { // Added page parameter for pagination
    const headers = authService.getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.reject(new Error("No authorization token found."));
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/buyer/purchases/`, {
        headers,
        params: { page } // Pass page number as query parameter
      });
      return response.data; // DRF ListAPIView with pagination returns { count, next, previous, results }
    } catch (error) {
      console.error("Error fetching buyer purchases:", error.response || error);
      throw error.response?.data || error;
    }
  },

  getSellerDashboardSummary: async () => {
    const headers = authService.getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.reject(new Error("No authorization token found."));
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/seller/summary/`, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching seller dashboard summary:", error.response || error);
      throw error.response?.data || error;
    }
  },

  getSellerAgents: async (page = 1) => {
    const headers = authService.getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.reject(new Error("No authorization token found."));
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/seller/agents/`, {
        headers,
        params: { page }
      });
      return response.data; // Expects paginated response: { count, next, previous, results }
    } catch (error) {
      console.error("Error fetching seller agents:", error.response || error);
      throw error.response?.data || error;
    }
  },

  createOrder: async (agentId) => {
    const headers = authService.getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.reject(new Error("No authorization token found."));
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/orders/create/`, { agent_id: agentId }, { headers });
      return response.data; // Expected to return serialized Order data
    } catch (error) {
      console.error("Error creating order:", error.response || error);
      throw error.response?.data || error; // Throw detailed error from backend if available
    }
  },
};
