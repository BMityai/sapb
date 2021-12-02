import Validator from 'validatorjs';
import ValidationException from 'sosise-core/build/Exceptions/Validation/ValidationException';
import SaveStatusRequestParamsType from '../../Types/SaveStatusRequestParamsType';
import Helper from 'sosise-core/build/Helper/Helper';

/**
 * If you need more validation rules, see: https://github.com/mikeerickson/validatorjs
 */
export default class SaveWarehousesUnifier {

    private params: any;
    public data: SaveStatusRequestParamsType[];
    public userId: number;

    /**
     * Constructor
     */
    constructor(params: any) {
        // Remember incoming params
        this.params = this.prepareParams(params);

        // Validate, await is important otherwise we could not catch the exception
        this.validate();

        // Map data
        this.map();
    }

    /**
     * Request data validation
     */
    private validate() {
        // Create validator
        const validator = new Validator(this.params, {
            'data.*.crm': ['required', 'min:1'],
            'data.*.kaspi': ['required', 'min:1']
        });

        // If it fails throw exception
        if (validator.fails()) {
            throw new ValidationException('Validation exception', (validator.errors.all() as any));
        }
    }

    /**
     * Request data mapping
     */
    private map() {
        this.data = this.params.data;
        this.userId = this.params.userId;
    }

    private prepareParams(params: any): any {
        const preparedParams = {data: new Array()};

        for(const param of params) {

            if(param.new && param.removed) continue;
            preparedParams.data.push(param);
        }

        return preparedParams;
    }
}
