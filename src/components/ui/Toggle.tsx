import clsx from 'clsx';

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/** On/off switch matching the toggles on the invoice screens. */
export function Toggle({ id, checked, onChange, label }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx('relative w-11 h-6 rounded-full transition-colors flex-shrink-0', checked ? 'bg-primary' : 'bg-gray-30')}
    >
      <span
        className={clsx(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  );
}
