import { ManageUrlType } from "../model/manage-url-model";
import { ILogger } from "../utils/logger/logger";
import { IDatabase } from "./connections/database-connection";

export interface IManageUrlRepository {
    save: (data: ManageUrlType) => Promise<ManageUrlType>;
    findByUserId: (userId: number) => Promise<ManageUrlType[]>;
    existShort: (short: String) => Promise<Boolean>;
    findByUrlShort: (urlShort: String) => Promise<ManageUrlType|null>;
    remove: (id: number) => Promise<Boolean>;
}

export class ManageUrlRepository implements IManageUrlRepository{
    private databaseConnection: IDatabase;
    private logger: ILogger;
    constructor({ databaseConnection, logger }){
        this.databaseConnection = databaseConnection;
        this.logger = logger;
    }

    public async save(data: ManageUrlType): Promise<ManageUrlType> {
        try {
            if (!data) {
                this.logger.warn({ description: 'Nenhum dado do usuário foi informado' });
                return null;
            }
            const pool = await this.databaseConnection.getPool();
            const { rows: [manageUrl=null] } = await pool.query(`
                insert into manage_urls (url_origin, url_short, user_id, created_at, updated_at)
                values ($1, $2, $3, now(), now()) returning *;    
            `, [
                data.urlOrigin,
                data.urlShort,
                data.userId || null,
            ]);
            !manageUrl && this.logger.info({
                description: 'Url enurtada não foi salva',
                user: {
                    id: data.userId || null,
                    name: null,
                    email: null,
                }
            });
            return manageUrl;
        } catch(error) {
            this.logger.error({ description: 'Erro ao tentar salvar o usuário', error });
            return null;
        }
    }

    public async findByUserId(userId: number): Promise<ManageUrlType[]> {
        try {
            if (!userId) {
                this.logger.warn({ description: 'Nenhum usuário foi informado' });
                return [];
            }
            const pool = await this.databaseConnection.getPool();
            const { rows: manageUrl } = await pool.query(
                `
                    select
                        mu.id,
                        mu.url_origin as urlOrigin,
                        mu.url_short as urlShort,
                        mu.click_count as clickCount
                    from
                        manage_urls mu
                    where
                        mu.user_id = $1 and
                        mu.deleted_at is null;    
                `, [userId]
            );
            !manageUrl.length && this.logger.info({
                description: `Urls vinculado ao usuário de id ${userId} não foram localizadas`,
                user: {
                    id: userId,
                    name: null,
                    email: null,
                } 
            });
            return manageUrl;
        } catch(error) {
            this.logger.error({ description: `Erro ao tentar localizar as urls vinculadas ao usuário de id ${userId}`, error });
            return [];
        }
    }

    public async existShort(short: String): Promise<Boolean> {
        try {
            if (!short) {
                this.logger.warn({ description: 'Nenhuma url encurtada foi informada' });
                return true;
            }
            const pool = await this.databaseConnection.getPool();
            const { rows: [manageUrl=null] } = await pool.query(
                `
                    select
                        mu.url_short
                    from
                        manage_urls mu
                    where
                        mu.url_short = $1 and
                        mu.deleted_at is null
                    limit 1;    
                `, [short]
            );
            return !!manageUrl;
        } catch(error) {
            this.logger.error({ description: `Erro ao tentar localizar url encurtamentada ${short}`, error });
            return true;
        }
    }

    public async findByUrlShort(urlShort: String): Promise<ManageUrlType|null> {
        try {
            if (!urlShort) {
                this.logger.warn({ description: 'Nenhuma url encurtada foi informada' });
                return null;
            }
            const pool = await this.databaseConnection.getPool();
            const { rows: [manageUrl=null] } = await pool.query(
                `update manage_urls
                    set
                        click_count = click_count+1
                    where
                        url_short = $1 and
                        deleted_at is null
                    returning url_origin;    
                `, [urlShort]
            );

            if (!manageUrl) {
                return null;
            }

            return {
                urlOrigin: manageUrl.url_origin,
            };
        } catch(error) {
            this.logger.error({ description: `Erro ao tentar localizar url encurtamentada ${urlShort}`, error });
            return null;
        }
    }

    public async remove(id: number): Promise<Boolean> {
        try {
            if (!id) {
                this.logger.warn({ description: 'Nenhuma identificador de url encurtada foi informada' });
                return false;
            }
            const pool = await this.databaseConnection.getPool();
            const { rowCount } = await pool.query(
                `update manage_urls
                    set
                        deleted_at = now()
                    where
                        id = $1 and
                        deleted_at is null;    
                `, [id]
            );

            if (!rowCount) {
                return false;
            }

            return true;
        } catch(error) {
            this.logger.error({ description: `Erro ao tentar remover url encurtamentada de id ${id}`, error });
            return false;
        }
    }
}