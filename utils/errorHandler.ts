// utils/errorHandler.ts
// Centralized error handling and logging

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type ErrorSeverityType = typeof ErrorSeverity[keyof typeof ErrorSeverity];

export interface ErrorHandlingOptions {
  severity?: ErrorSeverityType;
  fallback?: any;
  rethrow?: boolean;
}

/**
 * Logs an error with consistent formatting
 */
export function logError(error: any, context: string = '', severity: ErrorSeverityType = ErrorSeverity.MEDIUM): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error?.message || String(error);
  const prefix = severity === ErrorSeverity.CRITICAL ? '🚨' : '⚠️';

  console.error(`${prefix} [${timestamp}] ${context}:`, errorMessage);

  // Log stack trace for high/critical errors
  if ((severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) && error?.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Gets a user-friendly error message
 */
export function getUserFriendlyMessage(error: any, fallback: string = 'Ein unerwarteter Fehler ist aufgetreten.'): string {
  if (!error) return fallback;

  const message = error?.message || String(error);

  // Common error patterns and their friendly messages
  const patterns = [
    { match: /permission.*denied/i, message: 'Berechtigung verweigert. Bitte prüfe die App-Einstellungen.' },
    { match: /network.*error|fetch.*failed/i, message: 'Netzwerkfehler. Bitte prüfe deine Internetverbindung.' },
    { match: /timeout|timed out/i, message: 'Die Anfrage dauert zu lange. Bitte versuche es erneut.' },
    { match: /not found|404/i, message: 'Die angeforderte Ressource wurde nicht gefunden.' },
    { match: /unauthorized|401|403/i, message: 'Zugriff verweigert. Bitte melde dich erneut an.' },
  ];

  for (const pattern of patterns) {
    if (pattern.match.test(message)) {
      return pattern.message;
    }
  }

  return fallback;
}

/**
 * Handles async operation with standardized error handling
 */
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  context: string = '',
  options: ErrorHandlingOptions = {}
): Promise<T | any> {
  const {
    severity = ErrorSeverity.MEDIUM,
    fallback = null,
    rethrow = false,
  } = options;

  try {
    return await asyncFn();
  } catch (error: any) {
    logError(error, context, severity);

    if (rethrow) {
      throw error;
    }

    return fallback;
  }
}