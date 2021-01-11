interface TableRowProps {
  children?: React.ReactElement[];
  className?: string;
}

export default function TableRow({
  children,
  className: givenClassName,
}: TableRowProps): React.ReactElement {
  const className = `dark:odd:bg-gray-700	dark:even:bg-gray-800 ${givenClassName}`;

  return <tr className={className}>{children}</tr>;
}
