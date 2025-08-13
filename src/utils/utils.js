export const randomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Receives an ISO date string and returns a string in the format "dd/MM/yyyy HH:mm"
 * in the America/Sao_Paulo timezone.
 * @param {string} isoDate - The ISO date string to format.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
