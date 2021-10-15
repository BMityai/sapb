import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import AdminAuthUnifier from "../../Unifiers/Adminhtml/AdminAuthUnifier";
import LoggerToDbService from "../LoggerToDbService";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import AdminUserNotFoundException from "../../Exceptions/AdminUserNotFoundException";
import AuthRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/Auth/AuthRepositoryInterface";
import authConfig from "../../../config/auth";
import PasswordIsNotValidException from "../../Exceptions/PasswordIsNotValidException";
import Helper from "sosise-core/build/Helper/Helper";



export default class AuthService {

    protected localStorageRepository: AuthRepositoryInterface;
    protected loggerService: LoggerService;
    protected loggerToDbService: LoggerToDbService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: AuthRepositoryInterface, loggerService: LoggerService, loggerToDbService: LoggerToDbService) {
        this.localStorageRepository = localStorageRepository;
        this.loggerService = loggerService;
        this.loggerToDbService = loggerToDbService;
    }

    /**
     * Auth user
     */
    public async auth(params: AdminAuthUnifier) {

        // Get user by username`
        const user = await this.localStorageRepository.getAdminUser(params.username);
        if (!user) {
            throw new AdminUserNotFoundException('User not found', params.username);
        }

        if (user.username === params.username || user.email.toUpperCase() === params.username.toUpperCase()) {
            const passwordIsValid = await bcrypt.compare(params.password, user.password);

            if (!passwordIsValid) {
                throw new PasswordIsNotValidException('Password is not valid', user.login);
            }
            const token = jwt.sign(
                { id: user.id },
                authConfig.secret,
                { expiresIn: authConfig.expires }
            )
            return {
                auth: true,
                token: token,
                user: user
            };
        }
        throw new AdminUserNotFoundException('User not found', params.username);
    }

    /**
     * Get admin user by jwt token
     */
    public async getUserByJwt(jwtToken: string): Promise<any> {
        try {
            const decoded = jwt.verify(jwtToken, authConfig.secret) as { id: string };
            const user = await this.localStorageRepository.getUserById(decoded.id);
            return { auth: true, user }
        } catch (e) {
            throw new AdminUserNotFoundException('User not found', jwtToken)
        }
    }

}