interface IWordmarkProps {
  className?: string;
}

// "Clinic" en el color de texto normal + "AR" en el acento índigo de la app
// (mismo recurso que resalta "un solo lugar" en el hero de la homepage).
export const Wordmark = ({ className }: IWordmarkProps) => (
  <span className={className}>
    Clinic<span className="text-accent-600">AR</span>
  </span>
);
