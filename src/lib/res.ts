import { Response } from 'express';
export function resErr(res: Response, code = 500, message: string) {
    return res.status(code).json({ error: message });
}
