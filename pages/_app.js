import { AuthProvider } from "../components/auth/AuthProvider";
import "@fontsource/press-start-2p/400.css";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return <AuthProvider><Component {...pageProps} /></AuthProvider>;
}
