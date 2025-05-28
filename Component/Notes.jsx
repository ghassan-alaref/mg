import React from "react";

export const Notes = ({ notes, setShowNotes }) => {
  // Function to close the Notes screen
  const closeNotesScreen = () => {
    setShowNotes(null);
  };

  // Return the modal UI if `notes` is provided
  return (
    <>
      {notes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal content container */}
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md mx-auto p-6 relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={closeNotesScreen}
            >
              ✕
            </button>
            {/* Notes content */}
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Note Details
              </h2>
              <div className="text-gray-700 text-left space-y-2">
                {notes.split(";;").map((entry, index) => (
                  <p key={index}>{entry}</p>
                ))}
              </div>
            </div>
            {/* Close action */}
            <div className="mt-6 text-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
                onClick={closeNotesScreen}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
