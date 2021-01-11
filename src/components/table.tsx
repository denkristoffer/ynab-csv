import Td from "../components/tableCell";

export interface Row {
  [key: string]: string;
}

export interface TableProps<T = Row> {
  data: T[];
  header?: React.ReactElement;
}

export default function Table<T = Row>({
  data,
  header,
}: TableProps<T>): React.ReactElement {
  return (
    <div className="max-w-max w-full flex-grow-0">
      <table className="table-fixed border-gray-200 w-full">
        {header || null}
        <tbody>
          {data.map((row, index) => {
            return (
              <tr
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-700 dark:even:bg-gray-800 border-b border-gray-200 dark:border-gray-600 w-full"
                key={index}
              >
                {Object.values(row).map((column: string, index) => {
                  return <Td key={`${column}-${index}`}>{column}</Td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
