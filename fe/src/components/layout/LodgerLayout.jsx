import Footer from "./Footer";
import Header from "./Header";

export default function LodgerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-grow">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
