import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import type { SyntheticEvent } from "react";

interface SuccessAlertProps {
  message: string;
  open: boolean;
  onClose: (event?: SyntheticEvent | Event, reason?: string) => void;
  autoHideDuration?: number;
}

const SuccessAlert = ({
  message,
  open,
  onClose,
  autoHideDuration = 2000,
}: SuccessAlertProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessAlert;
