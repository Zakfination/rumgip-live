'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary"
      style={{ width: '100%', marginTop: 16, cursor: pending ? 'wait' : 'pointer' }}
      aria-disabled={pending}
    >
      {pending ? 'Opening secure payment…' : 'Continue to secure payment'}
    </button>
  );
}
