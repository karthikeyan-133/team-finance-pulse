
import React from 'react';
import { Routes, Route } from "react-router-dom";
import CustomerPortal from "./pages/CustomerPortal";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerPortal />} />
      <Route path="*" element={<CustomerPortal />} />
    </Routes>
  );
};

export default App;
