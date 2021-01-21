import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { parse } from "papaparse";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { cleanDkb, isDkb } from "../lib/data";
import { useAsyncState } from "../lib/hooks";
import Dropzone from "../components/dropzone";
import Table from "../components/table";
import type { Row } from "../components/table";
import Td from "../components/tableCell";
import DownloadButton from "../components/downloadButton";
import { createStorage, readFromStorage, writeToStorage } from "../lib/storage";

const storage = createStorage();
const getStorage = readFromStorage(storage);
const setStorage = writeToStorage(storage);

const downloadUrlAsFile = (
  objectUrl: string,
  filename: string
): Promise<void> => {
  return new Promise((resolve, _reject) => {
    const a = document.createElement("a");
    a.download = filename;
    a.href = objectUrl;
    document.body.append(a);
    a.click();
    a.remove();
    resolve();
  });
};

const downloadStringAsFile = async (
  string: string,
  filename: string
): Promise<void> => {
  const file = new Blob([string], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(file);

  await downloadUrlAsFile(url, filename);

  URL.revokeObjectURL(url);
};

const Th = (props: any) => (
  <Td className="text-left font-semibold px-0" element="th" {...props} />
);

const SAMPLE_DATA_ROWS = 10;

interface Config {
  maps: {
    [key: string]: string;
  };
}

interface ColumnMap {
  Date: string;
  Payee: string;
  Memo: string;
  Outflow: string;
  Inflow: string;
}

export default function IndexPage(): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useAsyncState<Row[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvColumnMap, setCsvColumnMap] = useState<ColumnMap>({
    Date: "",
    Payee: "",
    Memo: "",
    Outflow: "",
    Inflow: "",
  });

  const isTransformed = useMemo(() => {
    return Object.values(csvColumnMap).some((value) => value !== "");
  }, [csvColumnMap]);

  useEffect(() => {
    if (csvColumns.length > 0) {
      const configItem = getStorage("config");

      if (configItem) {
        const config = JSON.parse(configItem) as Config;
        const columnsToFindMapBy = JSON.stringify(csvColumns);
        const existingMap = config.maps[columnsToFindMapBy];

        if (existingMap) {
          setCsvColumnMap(JSON.parse(existingMap));
        }
      }
    }
  }, [csvColumns]);

  useEffect(() => {
    if (isTransformed) {
      const configItem = getStorage("config");
      let config = { maps: {} };

      if (configItem) {
        config = JSON.parse(configItem) as Config;
      }

      config.maps = {
        ...config.maps,
        [JSON.stringify(csvColumns)]: JSON.stringify(csvColumnMap),
      };

      setStorage("config", JSON.stringify(config));
    }
  }, [csvColumns, csvColumnMap, isTransformed]);

  const parseCsv = useCallback(
    async (file: File, preview: boolean | undefined = true) => {
      setCsvColumns([]);
      setCsvColumnMap({
        Date: "",
        Payee: "",
        Memo: "",
        Outflow: "",
        Inflow: "",
      });
      setData([]);

      let text = await file.text();

      if (isDkb(text)) {
        text = cleanDkb(text);
      }

      parse<Row>(text, {
        header: true,
        preview: preview ? SAMPLE_DATA_ROWS : undefined,
        skipEmptyLines: "greedy",
        step: ({ data: row, errors }, parser) => {
          if (errors.length > 0) {
            console.error(errors);
            parser.abort();
          }

          setData(data.current.concat(row));
        },
        transform: (value) => {
          return value.trim();
        },
        transformHeader: (header) => {
          if (header.trim().length === 0) {
            header = "Unnamed column";
          }

          if (csvColumns.includes(header)) {
            let newHeader = header;
            let counter = 0;

            while (csvColumns.includes(newHeader)) {
              counter = counter + 1;
              newHeader = `${header} (${counter})`;
            }

            header = newHeader;
          }

          setCsvColumns((existingColumns) => [...existingColumns, header]);

          return header;
        },
      });
    },
    [csvColumns, data, setData]
  );

  const transformRow = useCallback(
    (row: Row) => {
      return Object.keys(csvColumnMap).map((key) => {
        const column = key as keyof ColumnMap;
        const columnInData = csvColumnMap[column];
        let cell = row[columnInData];

        if (cell) {
          switch (column) {
            case "Date": {
              cell = dayjs(cell, [
                "DD-MM-YYYY",
                "MM-DD-YYYY",
                "YYYY-MM-DD",
              ]).format("YYYY-MM-DD");
              break;
            }
            case "Outflow": {
              if (csvColumnMap["Outflow"] === csvColumnMap["Inflow"]) {
                cell = cell.startsWith("-") ? cell.slice(1) : "";
              }
              break;
            }
            case "Inflow": {
              if (csvColumnMap["Outflow"] === csvColumnMap["Inflow"]) {
                cell = cell.startsWith("-") ? "" : cell;
              }
              break;
            }
            default:
              break;
          }

          return cell;
        }

        return "";
      });
    },
    [csvColumnMap]
  );

  const previewData = useMemo(() => {
    const rows =
      data.current.length > 10 ? data.current.slice(0, 10) : data.current;

    return rows.map((row) => transformRow(row));
  }, [data, transformRow]);

  const buildCsvFromRows = useCallback(
    (dataToBuild: Row[]) => {
      const columns = Object.keys(csvColumnMap);
      const rows = dataToBuild.map((row) => {
        return transformRow(row).map((cell) => {
          // Escape any existing quotes in the cell
          const cellWithEscapedQuotes = cell.replace(/"/g, '""');

          return `"${cellWithEscapedQuotes}"`;
        });
      });
      const string =
        columns.map((column) => `"${column}"`).join(",") +
        "\n" +
        rows.join("\n");

      return string;
    },
    [csvColumnMap, transformRow]
  );

  const hasData = data.current.length > 0;

  return (
    <>
      <Head>
        <title>YNAB CSV</title>
      </Head>

      <div className="container h-full w-full bg-white max-w-none dark:bg-gray-800">
        <Dropzone hasFile={hasData} onDrop={parseCsv}>
          {hasData ? (
            <div className="flex flex-col h-full">
              <DownloadButton
                aria-hidden={!isTransformed}
                className={isTransformed ? "opacity-100" : "opacity-0"}
                isActive={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  const csv = buildCsvFromRows(data.current);
                  setIsLoading(false);
                  void downloadStringAsFile(csv, "ynab-data.csv");
                }}
              />

              <Table
                data={isTransformed ? previewData : []}
                header={
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                      {Object.keys(csvColumnMap).map((key) => {
                        const column = key as keyof ColumnMap;

                        return (
                          <Th key={column}>
                            <div>{column}</div>
                            <div>
                              <select
                                className="w-full"
                                onChange={(event) => {
                                  const value = event.target.value || "";

                                  setCsvColumnMap((current) => {
                                    return {
                                      ...current,
                                      [column]: value,
                                    };
                                  });
                                }}
                              >
                                <option value="">Select column&hellip;</option>
                                {csvColumns.map((csvColumn) => {
                                  return (
                                    <option
                                      key={csvColumn}
                                      value={csvColumn}
                                      selected={
                                        csvColumnMap[column] === csvColumn
                                      }
                                    >
                                      {csvColumn}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </Th>
                        );
                      })}
                    </tr>
                  </thead>
                }
              />

              <div className="flex items-center h-full w-full">
                <p className="text-center w-full dark:text-white">
                  {isTransformed
                    ? `Previewing the first ${SAMPLE_DATA_ROWS} rows.`
                    : "Select columns to preview data."}
                </p>
              </div>
            </div>
          ) : null}
        </Dropzone>
      </div>
    </>
  );
}
