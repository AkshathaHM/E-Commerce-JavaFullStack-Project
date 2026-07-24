export function getPaymentErrorDetails(error, fallbackMessage = 'Your transaction could not be completed.') {
  const rawMessage = typeof error === 'string' ? error : error?.message || '';
  const message = rawMessage.toLowerCase();

  if (message.includes('popup') || message.includes('blocked')) {
    return {
      title: 'Pop-ups are blocked',
      message: 'Please allow pop-ups to continue your payment.',
      kind: 'popup-blocked',
      canRetry: true,
    };
  }

  if (message.includes('failed to load') || message.includes('checkout script') || message.includes('sdk')) {
    return {
      title: 'Payment gateway unavailable',
      message: 'Unable to load payment gateway. Please check your internet connection.',
      kind: 'sdk-error',
      canRetry: true,
    };
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('internet')) {
    return {
      title: 'Connection issue',
      message: 'We could not reach the payment gateway. Please check your internet connection and try again.',
      kind: 'network-error',
      canRetry: true,
    };
  }

  if (message.includes('cancel') || message.includes('dismiss')) {
    return {
      title: 'Payment cancelled',
      message: 'Your payment was cancelled. No charges were made.',
      kind: 'cancelled',
      canRetry: true,
    };
  }

  return {
    title: 'Payment failed',
    message: fallbackMessage,
    kind: 'payment-failed',
    canRetry: true,
  };
}
