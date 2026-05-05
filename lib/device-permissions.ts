// Device permissions handler - 6 error states, browser-specific, OS-specific
// Production-ready camera/mic handler

import type { PermissionErrorState, DevicePermissionResult } from './types';

export const PERMISSION_ERRORS: Record<PermissionErrorState, {
  title: string;
  description: string;
  fixSteps: string[];
}> = {
  NotAllowedError: {
    title: 'Camera/Mic Access Denied',
    description: 'You blocked access to your camera or microphone.',
    fixSteps: [
      'Click the camera icon in your browser address bar',
      'Select "Allow" for camera and microphone',
      'Refresh the page and try again',
    ],
  },
  NotFoundError: {
    title: 'No Camera or Microphone Found',
    description: 'Your device doesn\'t have a camera or microphone, or they\'re not connected.',
    fixSteps: [
      'Connect a webcam or microphone to your computer',
      'Check that your device is recognized in system settings',
      'Try a different USB port or cable',
    ],
  },
  NotReadableError: {
    title: 'Camera/Mic Already In Use',
    description: 'Another app is using your camera or microphone.',
    fixSteps: [
      'Close Zoom, Teams, Meet, or other video apps',
      'Check your system for apps running in the background',
      'Refresh the page and try again',
    ],
  },
  OverconstrainedError: {
    title: 'Camera Settings Not Supported',
    description: 'The requested camera resolution or settings aren\'t available on your device.',
    fixSteps: [
      'Try a lower video quality setting',
      'Update your camera drivers',
      'Use a different camera if available',
    ],
  },
  SecurityError: {
    title: 'Security Error',
    description: 'Your browser blocked access due to security settings.',
    fixSteps: [
      'Make sure you\'re using HTTPS (not HTTP)',
      'Check your browser\'s security/privacy settings',
      'Try disabling browser extensions temporarily',
    ],
  },
  AbortError: {
    title: 'Access Interrupted',
    description: 'Something stopped the camera/mic request.',
    fixSteps: [
      'Refresh the page and try again',
      'Close other browser tabs using the camera',
      'Restart your browser',
    ],
  },
};

// Browser-specific instructions
export function getBrowserFixInstructions(browser: string, errorState: PermissionErrorState): string[] {
  const base = PERMISSION_ERRORS[errorState]?.fixSteps || [];

  if (errorState !== 'NotAllowedError') return base;

  const browserGuides: Record<string, string[]> = {
    chrome: [
      'Click the lock icon in the address bar → Site settings',
      'Set Camera and Microphone to "Allow"',
      'Refresh the page',
    ],
    firefox: [
      'Click the lock icon in the address bar → Connection secure',
      'Click "More information" → Permissions',
      'Allow camera and microphone',
    ],
    safari: [
      'Go to Safari → Settings → Websites → Camera',
      'Set this website to "Allow"',
      'Do the same for Microphone',
      'Refresh the page',
    ],
    edge: [
      'Click the lock icon → Permissions for this site',
      'Set Camera and Microphone to "Allow"',
      'Refresh the page',
    ],
  };

  const normalizedBrowser = browser.toLowerCase();
  for (const [key, steps] of Object.entries(browserGuides)) {
    if (normalizedBrowser.includes(key)) return steps;
  }

  return base;
}

export function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari')) return 'safari';
  return 'unknown';
}

export function detectOS(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

// Map DOMException name to our error state type
function mapError(error: DOMException | Error): PermissionErrorState {
  const name = error.name as PermissionErrorState;
  const valid: PermissionErrorState[] = [
    'NotAllowedError', 'NotFoundError', 'NotReadableError',
    'OverconstrainedError', 'SecurityError', 'AbortError',
  ];
  return valid.includes(name) ? name : 'AbortError';
}

export async function requestCameraAndMic(
  constraints: MediaStreamConstraints = { video: true, audio: true }
): Promise<DevicePermissionResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const devices = await navigator.mediaDevices.enumerateDevices();
    return { granted: true, stream, devices };
  } catch (error) {
    const err = error as DOMException;
    const errorState = mapError(err);
    return {
      granted: false,
      error: errorState,
      errorMessage: err.message,
    };
  }
}

export async function requestScreenShare(): Promise<DevicePermissionResult> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    return { granted: true, stream };
  } catch (error) {
    const err = error as DOMException;
    return {
      granted: false,
      error: mapError(err),
      errorMessage: err.message,
    };
  }
}

export async function enumerateDevices(): Promise<{
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: devices.filter((d) => d.kind === 'videoinput'),
    microphones: devices.filter((d) => d.kind === 'audioinput'),
    speakers: devices.filter((d) => d.kind === 'audiooutput'),
  };
}
