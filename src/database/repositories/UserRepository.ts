import AppDataSource from "../appDataSource";
import { Users } from "../entities/Users";

const UserRepository = AppDataSource.getRepository(Users).extend({});

export default UserRepository;
