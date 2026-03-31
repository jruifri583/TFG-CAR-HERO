import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

interface Props {
  children: JSX.Element;
  roles?: string[]; // ["administrador", "empleado", "cliente"]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user } = useAuth();
  const userRole = user?.rol?.slug ?? "";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
