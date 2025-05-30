import React from 'react';

const SettingsPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Settings</h1>
      <p>Manage your account settings and preferences here.</p>
      {/* Add settings options later, e.g., password change, email preferences, notifications */}
      <div>
        <h3>Account Settings (Placeholder)</h3>
        <ul>
          <li style={{ marginBottom: '10px' }}><button onClick={() => alert('Feature not implemented yet.')}>Change Password</button></li>
          <li style={{ marginBottom: '10px' }}><button onClick={() => alert('Feature not implemented yet.')}>Update Email Address</button></li>
          <li style={{ marginBottom: '10px' }}><label><input type="checkbox" /> Enable Email Notifications</label></li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;
