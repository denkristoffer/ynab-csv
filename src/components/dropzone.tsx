import { Fragment, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface DropzoneProps {
  children?: React.ReactElement | React.ReactElement[] | null;
  hasFile?: boolean;
  onDrop: (file: File) => void;
}

export default function Dropzone({
  children,
  hasFile,
  onDrop: callback,
}: DropzoneProps): React.ReactElement {
  const onDrop = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        if (file.name.endsWith(".csv")) {
          callback(file);
        }
      });
    },
    [callback]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className="w-full h-full position-absolute left-0 top-0"
    >
      {isDragActive ? (
        <div className="w-full h-full position-absolute left-0 top-0 bg-blue-200 flex items-center justify-center">
          <p className="text-center text-xl ">
            <span className="block text-5xl font-semibold m-b text-white">
              {hasFile
                ? "Drop a new CSV file to start over"
                : "Drop a CSV file here"}
            </span>
            <br />
            &nbsp;
          </p>
        </div>
      ) : null}
      <div
        className="w-full h-full flex items-center justify-center"
        // className={
        //   isDragActive
        //     ? "transition border-blue-400 border-dashed border-4 h-full w-full rounded  flex-col align-center"
        //     : "transition border-transparent border-dashed border-4 h-full w-full rounded flex-col align-center"
        // }
      >
        {children ? (
          children
        ) : (
          <Fragment>
            <input {...getInputProps()} className="appearance-none" />

            <p className="text-center text-xl cursor-pointer dark:text-white">
              <span className="block text-5xl font-semibold m-b">
                Drop a CSV file here
              </span>
              <br />
              or click to select
            </p>
          </Fragment>
        )}
      </div>
    </div>
  );
}
