import React, { useState, useEffect } from 'react';
import userService from '../../services/userService'; // Corrected path
import './ProfilePage.css'; // To be created

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    address_line1: '',
    city: '',
    zip_code: '',
    profile_picture_url: '',
  });
  const [userData, setUserData] = useState({ // For display, not all fields editable here
    username: '',
    email: '',
    first_name: '', // Assuming these come from a future user details endpoint or context
    last_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // Fetch basic user data from localStorage (as set during login)
    const storedUsername = localStorage.getItem('username');
    // In a real app, email and first/last name would ideally come from a dedicated user details endpoint or context
    // For now, we'll just use username from localStorage and leave others blank or mock them.
    setUserData(prev => ({
        ...prev,
        username: storedUsername || 'N/A',
        // email: 'user@example.com', // Mock or fetch if available
        // first_name: 'Mock',
        // last_name: 'User'
    }));

    userService.getUserProfile()
      .then(data => {
        setProfileData({
          address_line1: data.address_line1 || '',
          city: data.city || '',
          zip_code: data.zip_code || '',
          profile_picture_url: data.profile_picture_url || '',
        });
        // If UserDetailsSerializer returns these on /api/profile/ GET, update userData here
        // For now, assuming /api/profile/ GET returns UserProfile fields only
        // and User fields (first_name, last_name, email) would be part of a different fetch or context
        if(data.user) { // If backend UserProfileSerializer includes user details (e.g. UserDetailsSerializer)
            setUserData(prev => ({
                ...prev,
                username: data.user.username || prev.username,
                email: data.user.email || '',
                first_name: data.user.first_name || '',
                last_name: data.user.last_name || '',
            }));
        }
      })
      .catch(err => {
        setError('Failed to fetch profile. Please try again later.');
        console.error("Profile fetch error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for User model fields if they were editable through this form
  // const handleUserChange = (e) => {
  //   const { name, value } = e.target;
  //   setUserData(prev => ({ ...prev, [name]: value }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    // Data to be sent for UserProfile update
    const profileUpdatePayload = { ...profileData };

    try {
      await userService.updateUserProfile(profileUpdatePayload);
      // If also updating User fields (first_name, last_name) via a separate endpoint:
      // await userService.updateUserDetails({ first_name: userData.first_name, last_name: userData.last_name });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please check your input.');
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData.address_line1 && !userData.username) { // Show full page loading only on initial load
    return <div className="loading-message">Loading your profile...</div>;
  }

  return (
    <div className="profile-page-container form-container">
      <h1>My Profile</h1>
      <p>Update your personal information and address details.</p>

      {isLoading && <div className="loading-indicator small-loader">Saving...</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <section className="form-section">
          <h2>Account Information</h2>
          <div className="wf-form-group">
            <label htmlFor="username" className="wf-label">Username</label>
            <input type="text" id="username" name="username" className="wf-input" value={userData.username} readOnly disabled />
          </div>
          <div className="wf-form-group">
            <label htmlFor="email" className="wf-label">Email</label>
            <input type="email" id="email" name="email" className="wf-input" value={userData.email || 'Email not set'} readOnly disabled />
          </div>
           {/* First/Last name are on User model, not UserProfile.
               Backend /api/profile/ PUT using UserProfileSerializer won't update these.
               These would need a different endpoint or serializer modification on backend.
               For now, display as read-only or allow editing if a separate update mechanism is planned.
           */}
          <div className="form-row">
            <div className="wf-form-group">
                <label htmlFor="first_name" className="wf-label">First Name</label>
                <input type="text" id="first_name" name="first_name" className="wf-input" value={userData.first_name || ''} readOnly disabled title="To update, contact support or use a dedicated user details form if available."/>
            </div>
            <div className="wf-form-group">
                <label htmlFor="last_name" className="wf-label">Last Name</label>
                <input type="text" id="last_name" name="last_name" className="wf-input" value={userData.last_name || ''} readOnly disabled title="To update, contact support or use a dedicated user details form if available."/>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Contact & Address Details</h2>
          <div className="wf-form-group">
            <label htmlFor="address_line1" className="wf-label">Address Line 1</label>
            <input type="text" id="address_line1" name="address_line1" className="wf-input" value={profileData.address_line1} onChange={handleProfileChange} />
          </div>
          <div className="form-row">
            <div className="wf-form-group">
              <label htmlFor="city" className="wf-label">City</label>
              <input type="text" id="city" name="city" className="wf-input" value={profileData.city} onChange={handleProfileChange} />
            </div>
            <div className="wf-form-group">
              <label htmlFor="zip_code" className="wf-label">ZIP / Postal Code</label>
              <input type="text" id="zip_code" name="zip_code" className="wf-input" value={profileData.zip_code} onChange={handleProfileChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Profile Appearance (Optional)</h2>
          <div className="wf-form-group">
            <label htmlFor="profile_picture_url" className="wf-label">Profile Picture URL</label>
            <input type="url" id="profile_picture_url" name="profile_picture_url" className="wf-input" placeholder="https://example.com/image.png" value={profileData.profile_picture_url} onChange={handleProfileChange} />
             {profileData.profile_picture_url && (
                <div className="profile-picture-preview">
                    <img src={profileData.profile_picture_url} alt="Profile Preview" />
                </div>
            )}
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="wf-button primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
