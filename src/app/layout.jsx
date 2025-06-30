import LeaderNavbar from "./LeaderNavbar";
import "./layout.css";
export const metadata = {
  title: "Panel",
};

export default function LeaderLayout({ children }) {
  return (
    <html>
      <body>
        <div className="leader-layout">
          <LeaderNavbar />
          <div className="leader-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
