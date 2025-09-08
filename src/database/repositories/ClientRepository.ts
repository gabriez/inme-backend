import AppDataSource from "../appDataSource";
import { Client } from "../entities/Client";

const ClientRepository = AppDataSource.getRepository(Client).extend({});

export default ClientRepository;
