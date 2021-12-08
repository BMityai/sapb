import commander from 'commander';
import BaseCommand, { OptionType } from 'sosise-core/build/Command/BaseCommand';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import ExportOrdersService from '../../Services/ExportOrdersService';

export default class ExportNewOrdersCommand extends BaseCommand {
    /**
     * Command name
     */
    protected signature: string = 'sap:exportorders';

    /**
     * Command description
     */
    protected description: string = 'Export new orders to retail crm';

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
        const service = IOC.make(ExportOrdersService) as ExportOrdersService;

        await service.export();
    }
}
