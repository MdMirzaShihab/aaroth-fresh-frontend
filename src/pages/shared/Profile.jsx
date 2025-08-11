import React from 'react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="glass rounded-3xl p-12">
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Profile
          </h1>
          <p className="text-text-muted">
            Profile management page - redirects to role-specific profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;