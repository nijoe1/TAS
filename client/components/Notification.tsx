import React, { useEffect, useState } from "react";

type NotificationProps = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  wait: boolean;
  success: boolean;
  error: boolean;
  offchain?:boolean
};

const Notification: React.FC<NotificationProps> = ({
  isLoading,
  isSuccess,
  isError,
  wait,
  success,
  error,
  offchain
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if ((isLoading && !started) || isError || offchain) {
      setIsVisible(true);
      setStarted(false);
    }

    if (success || isError) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, isSuccess, isError, wait, success, error,offchain]);

  const notificationStyles: React.CSSProperties = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    padding: "12px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    display: isVisible ? "block" : "none",
    zIndex: 9999,  // Ensure it's on top of other elements
  };

  const notificationText = isLoading
    ? "Confirm Transaction..."
    : isError
    ? "Transaction will fail Attest off chain or Add less data"
    : wait && !success
    ? "Wait until transaction is confirmed"
    : success
    ? offchain?"Attested Succesfully":"Transaction confirmed"
    : error
    ? "An error occured try again"
    : "";
  const notificationColor = isLoading
    ? "#001" // Black for loading
    : isError
    ? "#cc0000" // Red for error
    : wait && !success
    ? "#ffcc00" // Yellow for wait
    : success
    ? "#00cc00" // Green for success
    : error
    ? "#cc0000" // Red for error
    : "";

  notificationStyles.backgroundColor = notificationColor;

  return isVisible ? (
    <div style={notificationStyles}>
      <div>{notificationText}</div>
    </div>
  ) : null;
};

export default Notification;
