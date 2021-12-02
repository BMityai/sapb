import commander from 'commander';
import BaseCommand, { OptionType } from 'sosise-core/build/Command/BaseCommand';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import GetNewOrdersFromKaspiService from '../../Services/GetNewOrdersFromKaspiService';

export default class GetNewOrdersFromKaspiCommand extends BaseCommand {
    /**
     * Command name
     */
    protected signature: string = 'kaspi:getneworders';

    /**
     * Command description
     */
    protected description: string = 'Imports new orders from the kaspi personal account';

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
        const service = IOC.make(GetNewOrdersFromKaspiService) as GetNewOrdersFromKaspiService;

        await service.getNewOrdersAndConvert();
    }
}
