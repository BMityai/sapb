
import lodash, { isNull } from 'lodash';
import Helper from 'sosise-core/build/Helper/Helper';

/**
 * If you need more validation rules, see: https://github.com/mikeerickson/validatorjs
 */
export default class PrimevueTableParamsConverterUnifier {

    private params: any;
    public sortField: string;
    public sortOrder: string;
    public pageNumber: number;
    public rows: number;
    public first: string;
    public applyFilter: boolean = false;
    public filters: string[] = [];

    public globalFilterFields: string[] = ['orderNumber'];

    /**
     * Constructor
     */
    constructor(params: any) {
        // Remember incoming params
        this.params = params._value;

        // Map data
        this.map();

    }

    /**
     * Request data mapping
     */
    private map() {
        
        this.setSort();
        this.setPagination();
        this.setFilters();
    }

    /**
     * Set sort values
     */
    private setSort() {
        this.sortField = lodash.get(this.params, 'sortField', 'id')
        const order = lodash.get(this.params, 'sortOrder', -1)
        if (order == 1) {
            this.sortOrder = 'ASC';
        } else {
            this.sortOrder = 'DESC';
        }
    }

    /**
     * Set pagination values
     */
    private setPagination() {
        const pageNumber = lodash.get(this.params, 'page', 0);
        this.pageNumber = pageNumber;
        this.first = lodash.get(this.params, 'first', 0);
        this.rows = lodash.get(this.params, 'rows', 10);
    }

    /**
     * Set filter values
     */
    private setFilters() {
        const filtersJson = JSON.parse(this.params).filters;

        for(const [field, params] of Object.entries(filtersJson)) {
            const order = params as any;

            // set global filter
            if(field == 'global') {
                this.setGlobalFilter(params as {value: string, matchMode: string});
                continue;
            }
            if(isNull(order.constraints[0].value) || !order.constraints[0].value.length) {
                continue;
            }
            if(!this.applyFilter) {
                this.applyFilter = true;
            }
            let result = ' ('; 
            let i = 0;
            for(const constraint of order.constraints) {
                i ++;
                result += ` ${field} ${this.convertFilterOrder(constraint as {value: string, matchMode: string})}`;
                if(i < order.constraints.length) {
                    result += order.operator;
                }
            }
            result += ')'
            
            this.filters.push(result);
        }
    }

    /**
     * Convert primevue filters to knex filters
     */
    private convertFilterOrder (filter: {value: string, matchMode: string}): string {
        switch(filter.matchMode) {
            case 'startsWith': 
            return ` LIKE '${filter.value}%'`;
            case 'contains': 
                return ` LIKE '%${filter.value}%'`;
            case 'notContains': 
                return ` NOT LIKE '%${filter.value}%'`
            case 'endsWith': 
                return ` LIKE '%${filter.value}'`
            case 'equals': 
                return ` '=' '${filter.value}'`
            case 'notEquals': 
                return ` '<>' '${filter.value}'`
            default:
                return '';
        }
    }

    private setGlobalFilter(filter: {value: string, matchMode: string}) {
        if(isNull(filter.value) || !filter.value.length) {
            return;
        }
        if(!this.applyFilter) {
            this.applyFilter = true;
        }
        let i = 0;
        let result = ' (';
        for(const field of this.globalFilterFields) {
            i++;
            result += ` ${field} LIKE '%${filter.value}%'`
            if(i < this.globalFilterFields.length) {
                result += ' OR';
            }
        }
        result += ')';

        return this.filters.push(result)
    }
}
