import { Fragment } from "react";
import type { MouseEvent } from "react";

import DownloadIcon from "../components/downloadIcon";

interface DownloadButtonProps {
  isActive?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function DownloadButton({
  isActive,
  onClick,
}: DownloadButtonProps): React.ReactElement {
  return (
    <button
      aria-label="Download CSV"
      className="flex flex-row rounded-md bg-black text-white text-center px-6 py-4 fixed bottom-8 right-8 no-select"
      disabled={isActive}
      onClick={onClick}
    >
      {isActive ? (
        "..."
      ) : (
        <Fragment>
          <DownloadIcon /> Download CSV
        </Fragment>
      )}
    </button>
  );
}
