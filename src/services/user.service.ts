import * as bcrypt from 'bcrypt';
import { IUser, UserModel } from '../models/app.model';

/**
*   User service class to handle user related functionalities
*/
export class UserService {

    /**
    * Creates a new user with the given email and password
    * @param email - Email of the user to be created
    * @param password - Password of the user to be created
    * @returns - Returns the created user object as a promise
    */
    public static async createUser(email: string, password: string): Promise<IUser> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({ email: email, password: hashedPassword });
        await user.save();
        return user;
    }

    /**
     * Logs in a user with the given email and password
     * @param email - Email of the user to be logged in
     * @param password - Password of the user to be logged in
     * @returns - Returns the logged in user object as a promise or null if the user is not found or the password is incorrect
     */
    public static async login(email: string, password: string): Promise<IUser | null> {
        let user = await UserModel.findOne({ email: email });
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        } else {
            await this.createUser(email, password);
            user = await UserModel.findOne({ email: email });
        }
        return user;
    }
}