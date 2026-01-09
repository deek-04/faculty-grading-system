import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (navigation.state.unsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [navigation.state.unsavedChanges]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (navigation.state.unsavedChanges) {
        event.preventDefault();
        setShowLeaveDialog(true);
        setPendingNavigation(location.pathname);
        // Push current state back to prevent immediate navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigation.state.unsavedChanges, location.pathname]);

  const handleConfirmLeave = () => {
    navigation.setUnsavedChanges(false);
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  };

  return (
    <>
      {children}
      
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page? 
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLeave}>
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmLeave}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}