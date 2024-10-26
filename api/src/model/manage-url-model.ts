import { IManageUrlRepository } from "../repository/manage-url-repository";
import { ILogger } from "../utils/logger/logger";

export type ManageUrlType = {
    id?: number;
    urlOrigin?: String;
    urlShort?: String;
    userId?: number;
    clickCount?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date|null;
}|null;

export interface IManageUrlModel {
    save: (manageUrl: ManageUrlType) => Promise<ManageUrlType>;
    findByUserId: (userId: number) => Promise<ManageUrlType[]|null>;
    findByUrlShort: (urlShort: String) => Promise<ManageUrlType|null>;
    remove: (id: number) => Promise<Boolean>;
};



export class ManageUrlModel implements IManageUrlModel{
    private manageUrlRepository: IManageUrlRepository;
    private exclude = [
        'id',
        'deleted_at',
        'url_origin',
        'user_id',
        'click_count',
        'created_at',
        'updated_at',
        'deleted_at',
    ];
    private logger: ILogger;
    private validate = {
        'urlOrigin': (value: any) => {
            try {
                new URL(String(value));
                return true;
            } catch(error) {
                this.logger.warn({ description: `URL ${String(value)} é inválida`, error });
                return false;
            }
        },
    };
    private charsAll: String = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    private origin: String;

    constructor({ manageUrlRepository, logger }) {
        this.manageUrlRepository = manageUrlRepository;
        this.logger = logger;
        const {
            SERVER_PORT,
            SERVER_PROTOCOL,
            SERVER_HOST,
            SERVER_HOST_PORT = `${SERVER_HOST}:${SERVER_PORT}`,
        } = process.env;
        this.origin = `${SERVER_PROTOCOL}://${SERVER_HOST_PORT}`;
    }

    private async fildsValidator(fields: any): Promise<Boolean> {
        const fildsMapping = Object.entries(fields).filter(
            ([field, value]) => this.validate[field] && this.validate[field](value)
        );
        return !!(Object.keys(this.validate).length === fildsMapping.length);
    }

    private async filter(data: ManageUrlType) {
        await Promise.all(this.exclude.map(async field => data && delete data[field]));
    }

    private shortUrl(): String {
        const charList = Array(6).fill('');
        const short = charList.map(t => this.charsAll[Math.round(Math.random() * this.charsAll.length - 1)]).join('');
        return `${this.origin}/${short}`;
    }

    public async save(data: any): Promise<ManageUrlType> {
        try {
            const isValide = await this.fildsValidator(data);
            if (isValide) {
                const short = await this.verifyShort();
                if (!short) {
                    this.logger.warn({ description: 'Não foi possivel gerar url encurtada' });
                    return null; 
                }

                const manageUrl = await this.manageUrlRepository.save({
                    urlOrigin: data.urlOrigin,
                    urlShort: short,
                    userId: data.userId,
                });

                await this.filter(manageUrl);
                return manageUrl;
            }
            this.logger.warn({ description: 'Os campos informado não são válidos' });
            return null;
        } catch(error) {
            this.logger.error({ description: 'Erro ao tentar acionar o metodo save', error });
            return null;
        }
    }

    public async findByUrlShort(urlShort: String): Promise<ManageUrlType|null> {
        try {
            const manageUrl = await this.manageUrlRepository.findByUrlShort(urlShort);
            return manageUrl;
        } catch(error) {
            this.logger.error({
                description: `Erro ao localizar url de origin vinculada a url encurtada ${urlShort}`,
                error,
            });
            return null;
        }
    };

    public async findByUserId(userId: number): Promise<ManageUrlType[]|null> {
        try {
            const manageUrl = await this.manageUrlRepository.findByUserId(userId);
            return manageUrl;
        } catch(error) {
            this.logger.error({
                description: `Erro ao localizar url de origin vinculada ao usuário ${userId}`,
                error,
            });
            return null;
        }
    };

    public async remove(id: number): Promise<Boolean> {
        try {
            const manageUrl = await this.manageUrlRepository.remove(id);
            return manageUrl;
        } catch(error) {
            this.logger.error({
                description: `Falha na remoção da url encurtada vinculada ao id ${id}`,
                error,
            });
            return false;
        }
    };

    private async verifyShort(): Promise<String|null> {
        try {
            const verification: {
                limit: number;
                exec: number;
                valid: String|null;
            } = { limit: 5, exec: 0, valid: null };

            do {
                const shortString = this.shortUrl();
                const exist = await this.manageUrlRepository.existShort(shortString);
                !exist && (verification.valid = shortString);
                verification.exec += 1;
            } while(verification.exec < verification.limit && !verification.valid);         
            
            return verification.valid;
        } catch(error) {
            this.logger.error({ description: 'Erro ao tentar verificar se url encurtada já existe', error });
            return null;
        }
    }
}