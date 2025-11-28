"use client";
import Spinner from "./Spinner";
const FullSreenLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center page-title bg-gray/80 z-100 overflow-hidden">
      <Spinner size={40} color="blue" />
    </div>
  );
};

export default FullSreenLoader;
