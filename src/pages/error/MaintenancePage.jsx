import React from 'react';
import { Settings, Clock } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-3xl p-12">
          <div className="w-24 h-24 bg-earthy-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-12 h-12 text-earthy-brown animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Under Maintenance
          </h1>
          <p className="text-text-muted mb-8">
            We're currently performing scheduled maintenance. We'll be back shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <Clock className="w-4 h-4" />
            <span>Estimated time: 30 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;