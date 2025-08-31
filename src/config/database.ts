import { Sequelize } from 'sequelize';
import { seedDatabase } from './seed';

// Importando variáveis de ambiente
const dbHost = import.meta.env.DB_HOST || process.env.DB_HOST || 'localhost';
const dbPort = parseInt(import.meta.env.DB_PORT || process.env.DB_PORT || '5432');
const dbUser = import.meta.env.DB_USER || process.env.DB_USER || 'postgres';
const dbPassword = import.meta.env.DB_PASSWORD || process.env.DB_PASSWORD || 'postgres';
const dbName = import.meta.env.DB_NAME || process.env.DB_NAME || 'wsp_platform';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  logging: false
});

export const initDatabase = async () => {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Sincronizar modelos
    // Em produção, use { force: false } para não perder dados
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o banco de dados.');
    
    // Executar seed de dados iniciais
    await seedDatabase();
    
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return false;
  }
};

export default sequelize;