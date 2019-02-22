import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as uuid from 'uuid';

export class FileController {
    private static _instant: FileController;
    private static _router: Router;
    public static get router(): Router {
        if (!this._instant) this._instant = new FileController();
        if (!this._router) {
            this._router = Router();
            this._router.post('/upload', this._instant.upload);
            this._router.get('/download', this._instant.download);
            this._router.get('/delete', this._instant.delete);
        }
        return this._router;
    }

    constructor() {
        if (!fs.existsSync(this.root + this.defaultDirectory)) fs.mkdirSync(this.root + this.defaultDirectory);
    }

    private defaultDirectory = '/assets';
    private root = process.cwd();

    private upload = async (req: Request, res: Response): Promise<void> => {
        const results: {
            key: string,
            originName: string,
            mimetype: string,
            encoding: string,
            filePath: string
        }[] = [];
        if (req.files && Object.keys(req.files).length > 0) {
            for (const key of Object.keys(req.files)) {
                const tmp = req.files[key];
                if (!Array.isArray(tmp)) {
                    const file = tmp;
                    const dir = this.generateDirectory();
                    const fileName = this.generateFileName(file.name);
                    const filePath = `${dir}/${fileName}`;
                    await file.mv(this.root + filePath);
                    results.push({
                        key: key,
                        originName: file.name,
                        mimetype: file.mimetype,
                        encoding: file.encoding,
                        filePath: filePath
                    });
                } else {
                    for (const file of tmp) {
                        const dir = this.generateDirectory();
                        const fileName = this.generateFileName(file.name);
                        const filePath = `${dir}/${fileName}`;
                        await file.mv(this.root + filePath);
                        results.push({
                            key: key,
                            originName: file.name,
                            mimetype: file.mimetype,
                            encoding: file.encoding,
                            filePath: filePath
                        });
                    }
                }
            }
        }
        res.json(results);
    }

    private download = (req: Request, res: Response) => {
        if (req.query.filePath) {
            const fullPath = this.root + req.query.filePath;
            if (!fs.existsSync(fullPath)) res.status(404).send('FILE NOT FOUND');
            else res.download(fullPath); // Set disposition and send it.
        } else res.status(404).send('FILE NOT FOUND');
    }

    private delete = (req: Request, res: Response) => {
        const filePath = req.query.filePath || '';
        if (filePath) {
            const fullPath = this.root + filePath;
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        res.status(200).send('DELETE SUCCESSFUL');
    }

    private generateDirectory = (): string => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = (today.getMonth() + 1).toString().padStart(2, '0');
        const dd = today.getDate().toString().padStart(2, '0');
        const dir = this.defaultDirectory + '/' + [yyyy, mm, dd].join('-');
        if (!fs.existsSync(this.root + dir)) fs.mkdirSync(this.root + dir);
        return dir;
    }

    private generateFileName = (fileName: string, prefix: string = ''): string => {
        const strs = fileName.split('.');
        let extension = '';
        if (strs.length > 1) extension = `.${strs[strs.length - 1]}`;
        return prefix + uuid.v4() + extension;
    }
}