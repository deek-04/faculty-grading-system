import React, { useState } from 'react';
import { Button } from '../ui/button';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { cn } from '../../lib/utils';

export interface BackButtonProps {
  fallbackRoute?: string;
  confirmMessage?: string;
  onBeforeNavigate?: () => Promise<boolean>;
  preserveState?: boolean;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function BackButton({
  fallbackRoute = '/dashboard',
  confirmMessage,
  onBeforeNavigate,
  preserveState = true,
  className,
  variant = 'ghost',
  size = 'default',
  disabled = false,
  showIcon = true,
  children = 'Back',
}: BackButtonProps) {
  const navigation = useNavigation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBackClick = async () => {
    if (disabled || isNavigating) return;

    // Check if there are unsaved changes
    if (navigation.state.unsavedChanges) {
      setShowConfirmDialog(true);
      return;
    }

    await performNavigation();
  };

  const performNavigation = async () => {
    setIsNavigating(true);

    try {
      // Call onBeforeNavigate if provided
      if (onBeforeNavigate) {
        const canNavigate = await onBeforeNavigate();
        if (!canNavigate) {
          setIsNavigating(false);
          return;
        }
      }

      // Determine target route
      const targetRoute = getTargetRoute();

      // Navigate back
      const success = await navigation.navigateTo(targetRoute, {
        preserveState,
        skipConfirmation: true,
      });

      if (!success) {
        console.warn('Navigation failed, using fallback route');
        await navigation.navigateTo(fallbackRoute, {
          preserveState,
          skipConfirmation: true,
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      await navigation.navigateTo(fallbackRoute, {
        preserveState,
        skipConfirmation: true,
      });
    } finally {
      setIsNavigating(false);
    }
  };

  const getTargetRoute = (): string => {
    // Get previous route from history
    const history = navigation.state.navigationHistory;
    if (history.length >= 2) {
      const previousRoute = history[history.length - 2];
      return previousRoute.route;
    }

    // Use fallback route
    return fallbackRoute;
  };

  const handleConfirmNavigation = async () => {
    setShowConfirmDialog(false);
    // Clear unsaved changes flag since user confirmed
    navigation.setUnsavedChanges(false);
    await performNavigation();
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  const getConfirmationMessage = (): string => {
    if (confirmMessage) return confirmMessage;
    return 'You have unsaved changes. Are you sure you want to go back? Your changes will be lost.';
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleBackClick}
        disabled={disabled || isNavigating}
        className={cn(
          'flex items-center gap-2',
          className
        )}
      >
        {isNavigating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          showIcon && <ArrowLeft className="h-4 w-4" />
        )}
        {children}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmNavigation}
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

// Specialized back button for grading interface
export function GradingBackButton({
  onBeforeNavigate,
  ...props
}: Omit<BackButtonProps, 'fallbackRoute'>) {
  const handleBeforeNavigate = async (): Promise<boolean> => {
    // Custom logic for grading interface
    if (onBeforeNavigate) {
      return await onBeforeNavigate();
    }
    return true;
  };

  return (
    <BackButton
      fallbackRoute="/dashboard"
      confirmMessage="You have unsaved grading progress. Are you sure you want to return to the dashboard? Your grading progress will be lost."
      onBeforeNavigate={handleBeforeNavigate}
      preserveState={true}
      {...props}
    />
  );
}

// Specialized back button for admin sections
export function AdminBackButton({
  onBeforeNavigate,
  ...props
}: Omit<BackButtonProps, 'fallbackRoute'>) {
  return (
    <BackButton
      fallbackRoute="/admin"
      onBeforeNavigate={onBeforeNavigate}
      preserveState={true}
      {...props}
    />
  );
}