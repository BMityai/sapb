export default interface OrdersInfoForTheLastYearForDashboardType {
    labels: string[];
    datasets: {
        all: number[],
        completed: number[],
        canceled: number[]
    }
}
