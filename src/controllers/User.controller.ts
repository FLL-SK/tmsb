import User, { IUser } from '../models/User.model';

interface ICreateUserInput {
    email: IUser['email'];
    fullName: IUser['fullName'];
    password: IUser['password'];
}

/*
async function CreateUser({ email, fullName, password }: ICreateUserInput): Promise<IUser> {
    return User.create<IUser>({
        email,
        fullName,
        password,
    } as IUser)
        .then((data: IUser) => {
            return data;
        })
        .catch((error: Error) => {
            throw error;
        });
}

export default {
    CreateUser,
};
*/
