import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { Button } from '../ui/button';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallbackLoginRoute?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  fallbackLoginRoute = '/login/community',
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackLoginRoute} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            പ്രവേശനാനുമതിയില്ല (Access Denied)
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            നിങ്ങളുടെ അക്കൗണ്ടിന് ({user.roleDisplayMl} / {user.role}) ഈ പോർട്ടലിലേക്ക് പ്രവേശിക്കാൻ അനുമതിയില്ല. ദയവായി അനുയോജ്യമായ പോർട്ടൽ തിരഞ്ഞെടുക്കുക.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Home className="w-4 h-4 mr-2" />
                ഹോം പേജിലേക്ക് മടങ്ങുക
              </Button>
            </Link>
            <Link to={fallbackLoginRoute}>
              <Button variant="primary" className="w-full flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
