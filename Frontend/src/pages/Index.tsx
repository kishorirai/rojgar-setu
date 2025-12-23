
import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
};

export default Index;
