import React from "react";

function InfoMessage({ message }: { message: string }) {
  return <div 
  className="p-5 border bg-gray-200 border-gray-500 text-sm text-gray-100 rounded"
  >{message}</div>;
}

export default InfoMessage;
