import { getSafeErrorMessage } from "./errors";

export function successResponse(data = null, message = undefined) {
  const response = { success: true, data };
  if (message) response.message = message;
  return response;
}

export function errorResponse(errorOrMessage) {
  const message =
    typeof errorOrMessage === "string"
      ? errorOrMessage
      : getSafeErrorMessage(errorOrMessage);

  return { success: false, message };
}
