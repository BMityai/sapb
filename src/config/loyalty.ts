const loyaltyConfig = {
    api: {
        urlForCustomerRegister: process.env.LS_REST_API_URL_FOR_CUSTOMER_REGISTER || null,
        userForCustomerRegister: process.env.LS_REST_API_USER_FOR_CUSTOMER_REGISTER || null,
        passForCustomerRegister: process.env.LS_REST_API_PASS_FOR_CUSTOMER_REGISTER || null,
        urlForGetCustomerInfo: process.env.LS_REST_API_URL_FOR_GET_INFO || null,
        keyForGetCustomerInfo: process.env.LS_REST_API_KEY_FOR_GET_INFO || null
    },
};

export default loyaltyConfig;
