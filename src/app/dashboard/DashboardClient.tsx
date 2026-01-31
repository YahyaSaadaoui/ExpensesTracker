"use client";

import dynamic from "next/dynamic";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const ExpensesTable = dynamic(
  () => import("./ExpensesTable"),
  { ssr: false }
);

export default function DashboardClient() {
  return <ExpensesTable />;
}
