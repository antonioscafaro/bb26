/**
 * Formatta un oggetto Date in una stringa YYYY-MM-DD.
 * @param {Date} date - L'oggetto Date da formattare.
 * @returns {string} La data formattata.
 */
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Calcola l'intervallo di date iniziale (ultimi 30 giorni).
 * @returns {{startDate: string, endDate: string}} L'intervallo di date.
 */
export const getInitialDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};