
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";
import GetAllOrdersInfoForDashboardType from "../../Types/GetAllOrdersInfoForDashboardType";
import GetOrdersResponseType from "../../Types/GetOrdersResponseType";
import OrdersInfoForTheLastYearForDashboardType from "../../Types/OrdersInfoForTheLastYearForDashboardType";
import LoggerToDbService from "../LoggerToDbService";

export default class DashboardService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected loggerService: LoggerService;
    protected loggerToDbService: LoggerToDbService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: LocalStorageRepositoryInterface, loggerService: LoggerService, loggerToDbService: LoggerToDbService) {
        this.localStorageRepository = localStorageRepository;
        this.loggerService = loggerService;
        this.loggerToDbService = loggerToDbService;
    }

    /**
     * Get all orders info for dashboard task-boxes
     */
    public async getAllOrdersInfo(): Promise<GetAllOrdersInfoForDashboardType> {

        // @todo нужно доработать, получать данные из БД

        return {
            allOrders: 785,
            today: 21,
            completed: 365,
            canceled: 254
        };
    }

    /**
     * Get data on orders for the last year for dashboard chart
     */
    public async getOrdersInfoForTheLastYear(): Promise<OrdersInfoForTheLastYearForDashboardType> {

        const result = {
            labels: [
                "январь",
                "февраль",
                "март",
                "апрель",
                "май",
                "июнь",
                "июль",
                "август",
                "сентябрь",
                "октябрь",
                "ноябрь",
                "декабрь",
            ],
            datasets: {
                all: [250, 260, 500, 400, 356, 245, 652, 235, 589, 789, 257, 985],
                completed: [211, 215, 488, 352, 352, 198, 600, 215, 500, 659, 199, 895],
                canceled: [39, 45, 62, 48, 4, 47, 52, 20, 89, 130, 58, 90]
            }

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
}
