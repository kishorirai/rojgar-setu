
import React from "react";
import AppLayout from "@/components/layouts/AppLayout";

const KnowledgeBase = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-gray-500">Access helpful resources and documentation</p>
        </div>
        
        <div className="bg-white p-10 rounded-md shadow text-center">
          <h2 className="text-xl font-medium text-gray-700">Knowledge Base</h2>
          <p className="text-gray-500 mt-2">This page is under construction.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default KnowledgeBase;
