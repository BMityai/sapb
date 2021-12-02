const kaspibankConfig = {
    api: {
        baseurl: process.env.KASPI_API_URL,
        apiKeyForMarwin: process.env.KASPI_API_KEY_MARWIN,
        apiKeyForKomfort: process.env.KASPI_API_KEY_KOMFORT,
    },
    orderPerPage: process.env.KASPI_ORDERS_PER_PAGE,
    period: -parseInt(process.env.KASPI_ORDERS_PERIOD || '3', 10),
    returnRequestedPeriod: -parseInt(process.env.KASPI_RETURN_REQUESTED_ORDERS_PERIOD || '14', 10),
    returnedPeriod: -parseInt(process.env.KASPI_RETURNED_ORDERS_PERIOD || '14', 10)
};

export default kaspibankConfig;
