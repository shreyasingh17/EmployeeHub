import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  hasUnsavedChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (!component?.hasUnsavedChanges()) {
    return true;
  }

  return window.confirm('You have unsaved changes. Do you want to leave this page?');
};
