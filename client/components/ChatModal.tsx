import React, { useState } from "react";
import { Discussion } from "@orbisclub/components";
import "@orbisclub/components/dist/index.modern.css";


const ChatModal = ({ isOpen, closeModal }) => {
    if (!isOpen) {
      return null;
    }
  
    // Close the modal when clicking outside of it
    const handleOutsideClick = (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    };
  
    return (
      <div
        className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
        onClick={handleOutsideClick}
      >
        <div className="bg-white w-3/4 h-3/4 max-w-lg max-h-lg rounded-lg overflow-y-auto">
          <div className="p-4 flex justify-end">
            {/* Close button on the top right */}
            <button
              className="bg-white hover:bg-black hover:text-white text-black py-2 px-4 rounded"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
          <div className="p-6">
            <Discussion
            theme="kjzl6cwe1jw148zvv7qwzddew4dj4d1pp04a1q71zgghbkagfrpt71iaatwgf2d" 
              context="HEY"
              className="!p-0 !m-0 !bg-white !rounded-lg" // Apply styles here
            />
          </div>
        </div>
      </div>
    );
  };

  export default ChatModal;