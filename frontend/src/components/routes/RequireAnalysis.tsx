import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface RequireAnalysisProps {
  children: React.ReactNode;
  mode: 'running-only' | 'complete-only';
}

export function RequireAnalysis({ children, mode }: RequireAnalysisProps) {
  const { analysisStatus } = useApp();
  const location = useLocation();

  if (mode === 'running-only') {
    if (analysisStatus === 'idle') {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
    if (analysisStatus === 'complete') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  if (analysisStatus !== 'complete') {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
