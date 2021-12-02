import Validator from 'validatorjs';
import ValidationException from 'sosise-core/build/Exceptions/Validation/ValidationException';

/**
 * If you need more validation rules, see: https://github.com/mikeerickson/validatorjs
 */
export default class CreateUserUnifier {

    private params: any;
    public username: string;
    public firstname: string;
    public lastname: string;
    public email: string;
    public password: string;
    public userId: number;

    /**
     * Constructor
     */
    constructor(params: any) {
        // Remember incoming params
        this.params = params;

        // Validate, await is important otherwise we could not catch the exception
        this.validate();

        // Map data
        this.map();
    }

    /**
     * Request data validation
     */
    private validate() {

        const costomErrorMessages = {
            required: 'Обязательное для заполнения поле',
            email: 'Введите корректный email',
            min: {
                string: 'Минимальное количество символов: :min'
            },
        };

        // Create validator
        const validator = new Validator(this.params, {
            'username.value': ['required'],
            'firstname.value': ['required'],
            'email.value': ['required'],
            'password.value': ['required', 'min:6'],
        }, costomErrorMessages);



        // If it fails throw exception
        if (validator.fails()) {
            throw new ValidationException('Validation exception', (validator.errors.all() as any));
        }
    }

    /**
     * Request data mapping
     */
    private map() {
        this.username = this.params.username.value;
        this.firstname = this.params.firstname.value;
        this.lastname = this.params.lastname.value;
        this.email = this.params.email.value;
        this.password = this.params.password.value;
        this.userId = this.params.userId;
    }
}
