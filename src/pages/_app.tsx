import type { AppProps } from "next/app";

import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  return <Component className="font-sans" {...pageProps} />;
}

export default App;
