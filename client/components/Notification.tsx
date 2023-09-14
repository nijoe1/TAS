import React, { useEffect, useState } from "react";

type NotificationProps = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

const Notification: React.FC<NotificationProps> = ({
  isLoading,
  isSuccess,
  isError,
}) => {
  const [successful, setSuccessful] = useState(false);

  useEffect(() => {
    setSuccessful(true);
    // Automatically hide the success message after 4 seconds if it's a success
    if (isSuccess) {
      const hideSuccessTimeout = setTimeout(() => {
        setSuccessful(false); // Hide the entire notification
      }, 4000); // Hide after 4 seconds

      // Clear the hide timeout on unmount to avoid memory leaks
      return () => {
        clearTimeout(hideSuccessTimeout);
      };
    }
    if (isError) {
        const hideSuccessTimeout = setTimeout(() => {
          setSuccessful(false); // Hide the entire notification
        }, 4000); // Hide after 4 seconds
  
        // Clear the hide timeout on unmount to avoid memory leaks
        return () => {
          clearTimeout(hideSuccessTimeout);
        };
      }
  }, [isLoading, isSuccess]);

  const notificationClasses = `fixed bottom-20 items-center flex flex-col  p-2 mx-auto rounded-md ${
    isLoading
      ? "border bg-black text-white"
      : isSuccess && successful
      ? "border bg-green-500 text-white"
      : isError
      ? "border bg-red-500 text-white"
      : ""
  }`;

  const notificationText = isLoading
    ? "Loading..."
    : isSuccess && successful
    ? "Transaction created successfully!"
    : isError
    ? "Transaction failed. Please try again."
    : "";

  return <div className={notificationClasses}>{notificationText}</div>;
};

export default Notification;
