import commander from 'commander';
import BaseCommand, { OptionType } from 'sosise-core/build/Command/BaseCommand';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import GetChangesFromKaspiService from '../../Services/GetChangesFromKaspiService';
import GetNewOrdersFromKaspiService from '../../Services/GetNewOrdersFromKaspiService';

export default class GetChangesFromKaspiCommand extends BaseCommand {
    /**
     * Command name
     */
    protected signature: string = 'sap:getchanges';

    /**
     * Command description
     */
    protected description: string = 'Get order changes from the kaspi';

    /**
     * When command is executed prevent from double execution
     */
    protected singleExecution: boolean = true;

    /**
     * Command options
     */
    protected options: OptionType[] = [];


    /**
     * Execute the console command
     */
    public async handle(cli: commander.Command): Promise<void> {
        const service = IOC.make(GetChangesFromKaspiService) as GetChangesFromKaspiService;

        await service.execute();
    }
}
