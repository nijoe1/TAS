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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the notification
    setIsVisible(true);

    // Automatically hide the notification after 5 seconds if it's not in the loading state
    if (!isLoading) {
      const hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Hide after 5 seconds

      // Clear the hide timeout on unmount to avoid memory leaks
      return () => {
        clearTimeout(hideTimeout);
      };
    }

    // Automatically hide the success message after 4 seconds if it's a success
    if (isSuccess) {
      const hideSuccessTimeout = setTimeout(() => {
        setIsVisible(false); // Hide the entire notification
      }, 4000); // Hide after 4 seconds

      // Clear the hide timeout on unmount to avoid memory leaks
      return () => {
        clearTimeout(hideSuccessTimeout);
      };
    }
  }, [isLoading, isSuccess]);

  const notificationClasses = `fixed bottom-12 right-4 p-2 rounded-md ${
    isVisible
      ? "opacity-100 transition-opacity duration-300"
      : "opacity-0 transition-opacity duration-300"
  } ${
    isLoading
      ? "bg-blue-500 text-white"
      : isSuccess
      ? "bg-green-500 text-white"
      : isError
      ? "bg-red-500 text-white"
      : ""
  }`;

  const notificationText = isLoading
    ? "Loading..."
    : isSuccess && isVisible // Only show the success message when isVisible is true
    ? "Loading!"
    : isSuccess && !isVisible
    ? "Transaction created successfully!"
    : isError
    ? "Transaction failed. Please try again."
    : "";

  return <div className={notificationClasses}>{notificationText}</div>;
};

export default Notification;