import React, { useState } from 'react';
import './SettingsPage.css'; // To be created

const SettingsPage = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [notifications, setNotifications] = useState({
    purchaseNotifications: true,
    newsletter: false,
    newFeatureUpdates: true,
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');


  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError(''); // Clear previous errors
    setPasswordSuccess('');
    let newPasswordError = '';

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newPasswordError = "New passwords do not match.";
    } else if (passwordData.newPassword.length > 0 && passwordData.newPassword.length < 8) { // Check length only if new password is not empty
      newPasswordError = "New password must be at least 8 characters long.";
    }

    if (newPasswordError) {
      setPasswordError(newPasswordError);
      return;
    }

    // UI Only: Simulate API call for password change
    console.log("Password change submitted (UI only):", passwordData);
    setPasswordSuccess("Password change functionality not implemented yet. This is a UI placeholder.");
    // Reset form after mock submission
    // setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    setNotificationSuccess('');
    // UI Only: Simulate API call for notification preferences
    console.log("Notification preferences submitted (UI only):", notifications);
    setNotificationSuccess("Notification preferences functionality not implemented yet. This is a UI placeholder.");
  };


  return (
    <div className="settings-page-container form-container">
      <h1>Settings</h1>
      <p>Manage your account settings and notification preferences.</p>

      {/* Change Password Section */}
      <section className="form-section">
        <h2>Change Password</h2>
        {passwordError && <div className="error-message small-error">{passwordError}</div>}
        {passwordSuccess && <div className="success-message small-success">{passwordSuccess}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="wf-form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className="wf-input"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="wf-form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={`wf-input ${passwordError ? 'input-error' : ''}`}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="wf-form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              className={`wf-input ${passwordError ? 'input-error' : ''}`}
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              required
            />
            {/* Display error message directly related to password fields if it's a password specific error */}
            {/* For now, the general passwordError above the form is used */}
          </div>
          <div className="form-actions">
            <button type="submit" className="wf-button primary">Change Password</button>
          </div>
        </form>
      </section>

      {/* Notification Preferences Section */}
      <section className="form-section">
        <h2>Notification Preferences</h2>
        {notificationSuccess && <div className="success-message small-success">{notificationSuccess}</div>}
        <form onSubmit={handleNotificationSubmit}>
          <div className="wf-form-group checkbox-group">
            <input
              type="checkbox"
              id="purchaseNotifications"
              name="purchaseNotifications"
              checked={notifications.purchaseNotifications}
              onChange={handleNotificationChange}
            />
            <label htmlFor="purchaseNotifications">Email notifications for new agent purchases and updates.</label>
          </div>
          <div className="wf-form-group checkbox-group">
            <input
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={notifications.newsletter}
              onChange={handleNotificationChange}
            />
            <label htmlFor="newsletter">Subscribe to AI Marketplace newsletter.</label>
          </div>
          <div className="wf-form-group checkbox-group">
            <input
              type="checkbox"
              id="newFeatureUpdates"
              name="newFeatureUpdates"
              checked={notifications.newFeatureUpdates}
              onChange={handleNotificationChange}
            />
            <label htmlFor="newFeatureUpdates">Receive updates about new platform features and promotions.</label>
          </div>
          <div className="form-actions">
            <button type="submit" className="wf-button primary">Save Notification Preferences</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SettingsPage;
