import React from 'react';
import { LoginLayout } from '../../components/layout/AuthLayout';
import LoginForm from '../../components/forms/LoginForm';
import { GuestRoute } from '../../components/auth/ProtectedRoute';

/**
 * LoginPage Component
 *
 * Login page with guest route protection to redirect authenticated users
 */
const LoginPage = () => {
  return (
    <GuestRoute>
      <LoginLayout>
        <LoginForm />
      </LoginLayout>
    </GuestRoute>
  );
};

export default LoginPage;
