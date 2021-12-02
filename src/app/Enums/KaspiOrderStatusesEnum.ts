enum KaspiOrderStatusesEnum {
    approved = 'APPROVED_BY_BANK',
    accepted = 'ACCEPTED_BY_MERCHANT',
    canceled = 'CANCELLED',
    completed = 'COMPLETED',
    arrived = 'ARRIVED',
    returned = 'RETURNED',
    returnRequested = 'KASPI_DELIVERY_RETURN_REQUESTED',
}
export default KaspiOrderStatusesEnum;
