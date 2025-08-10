import React from 'react';
import { RegisterLayout } from '../../components/layout/AuthLayout';
import RegisterForm from '../../components/forms/RegisterForm';
import { GuestRoute } from '../../components/auth/ProtectedRoute';

/**
 * RegisterPage Component
 *
 * Registration page with guest route protection
 */
const RegisterPage = () => {
  return (
    <GuestRoute>
      <RegisterLayout>
        <RegisterForm />
      </RegisterLayout>
    </GuestRoute>
  );
};

export default RegisterPage;
