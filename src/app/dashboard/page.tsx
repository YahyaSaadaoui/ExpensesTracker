import Navbar from "./Navbar";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="p-6">
        <DashboardClient />
      </main>
    </>
  );
}
