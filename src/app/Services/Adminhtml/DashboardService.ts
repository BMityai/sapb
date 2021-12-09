
import dayjs from "dayjs";
import Helper from "sosise-core/build/Helper/Helper";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";
import GetAllOrdersInfoForDashboardType from "../../Types/GetAllOrdersInfoForDashboardType";
import GetOrdersResponseType from "../../Types/GetOrdersResponseType";
import OrdersCountInfoByMonthType from "../../Types/OrdersCountInfoByMonthType";
import OrdersInfoForTheLastYearForDashboardType from "../../Types/OrdersInfoForTheLastYearForDashboardType";

export default class DashboardService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected loggerService: LoggerService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: LocalStorageRepositoryInterface, loggerService: LoggerService) {
        this.localStorageRepository = localStorageRepository;
        this.loggerService = loggerService;
    }

    /**
     * Get all orders info for dashboard task-boxes
     */
    public async getAllOrdersInfo(): Promise<GetAllOrdersInfoForDashboardType> {

        return await this.localStorageRepository.getDataOnTheNumberOfOrders();
    }

    /**
     * Get data on orders for the last year for dashboard chart
     */
    public async getOrdersInfoForTheLastYear(): Promise<OrdersInfoForTheLastYearForDashboardType> {

        // Get last months list
        const months = this.getMonths();

        // Get status data
        const datasets = await this.getOrdersStatusData();

        const result = {
            labels: months,
            datasets
        };

        return result;
    }

    /**
     * Get data on orders for the last year for dashboard chart
     */
    public async getOrders(): Promise<GetOrdersResponseType> {

        const orders = [
            {
                id: 1,
                orderNumber: "KSP-123456",
                kaspiStatus: 'new',
                crmStatus: 'new',
                createdAt: '2021-11-25 14:00:00',
                updatedAt: '2021-11-25 14:00:00',
                data: {
                    products: [
                        { name: 'testproduct 1', xmlId: 'test xml id 1', qty: 2, price: 568 },
                        { name: 'testproduct 2', xmlId: 'test xml id 2', qty: 1, price: 1254 },
                        { name: 'testproduct 3', xmlId: 'test xml id 3', qty: 12, price: 11254 },
                    ],
                    isExpress: false,
                    exportedToCrmData: '{id:"testId"}',
                    log: [
                        '2021-11-25 14:00:00 Create new order'
                    ]
                }
            },
            {
                id: 2,
                orderNumber: "KSP-123456",
                kaspiStatus: 'new',
                crmStatus: 'new',
                createdAt: '2021-11-25 14:00:00',
                updatedAt: '2021-11-25 14:00:00',
                data: {
                    products: [
                        { name: 'testproduct 1', xmlId: 'test xml id 1', qty: 2, price: 568 },
                        { name: 'testproduct 2', xmlId: 'test xml id 2', qty: 1, price: 1254 },
                        { name: 'testproduct 3', xmlId: 'test xml id 3', qty: 12, price: 11254 },
                    ],
                    isExpress: false,
                    exportedToCrmData: '{id:"testId"}',
                    log: [
                        '2021-11-25 14:00:00 Create new order'
                    ]
                }
            },
            {
                id: 3,
                orderNumber: "KSP-123456",
                kaspiStatus: 'new',
                crmStatus: 'new',
                createdAt: '2021-11-25 14:00:00',
                updatedAt: '2021-11-25 14:00:00',
                data: {
                    products: [
                        { name: 'testproduct 1', xmlId: 'test xml id 1', qty: 2, price: 568 },
                        { name: 'testproduct 2', xmlId: 'test xml id 2', qty: 1, price: 1254 },
                        { name: 'testproduct 3', xmlId: 'test xml id 3', qty: 12, price: 11254 },
                    ],
                    isExpress: false,
                    exportedToCrmData: '{id:"testId"}',
                    log: [
                        '2021-11-25 14:00:00 Create new order'
                    ]
                }
            },
            {
                id: 4,
                orderNumber: "KSP-123456",
                kaspiStatus: 'new',
                crmStatus: 'new',
                createdAt: '2021-11-25 14:00:00',
                updatedAt: '2021-11-25 14:00:00',
                data: {
                    products: [
                        { name: 'testproduct 1', xmlId: 'test xml id 1', qty: 2, price: 568 },
                        { name: 'testproduct 2', xmlId: 'test xml id 2', qty: 1, price: 1254 },
                        { name: 'testproduct 3', xmlId: 'test xml id 3', qty: 12, price: 11254 },
                    ],
                    isExpress: false,
                    exportedToCrmData: '{id:"testId"}',
                    log: [
                        '2021-11-25 14:00:00 Create new order',
                        '2021-11-25 14:00:00 Create new order',
                        '2021-11-25 14:00:00 Create new order',
                    ]
                }
            }
        ];
        const response = {
            totalRecords: 235,
            orders
        };

        return response;
    }

    /**
     * Get last month list
     */
    private getMonths(): string[] {

        // All months
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        // Get current month number
        const currentMonthNumber = this.getCurrentMonthNumber();

        // Get last month list
        let result = monthNames.slice(0, currentMonthNumber);
        if(currentMonthNumber < 3) {
            const emptyMonthList = new Array();
            result = emptyMonthList.concat(monthNames.slice(9, 12), result);
        }

        return result;
    }

    /**
     * Get order status info by month
     */
    private async getOrdersStatusData(): Promise<OrdersCountInfoByMonthType> {

        const promise = new Array();

        promise.push(this.localStorageRepository.getAllOrdersByMonth(this.getCurrentMonthNumber()));
        promise.push(this.localStorageRepository.getCompletedOrdersByMonth(this.getCurrentMonthNumber()));
        promise.push(this.localStorageRepository.getCanceledOrdersByMonth(this.getCurrentMonthNumber()));
    
        const result = await Promise.all(promise);

        return {
            all: result[0],
            completed: result[1],
            canceled: result[2]
        }
    }

    /**
     * Get current month number
     */
    private getCurrentMonthNumber(): number {
       return dayjs().month() + 1;
    }
}
