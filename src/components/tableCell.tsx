interface TableCellProps {
  children?: React.ReactText;
  className?: string;
  element?: "td" | "th";
}

export default function TableCell({
  children,
  className: classNameProperty,
  element = "td",
}: TableCellProps): React.ReactElement {
  const className = `px-4 py-2 text-left dark:text-white ${classNameProperty}`;
  const Element = element;

  return <Element className={className}>{children}</Element>;
}
