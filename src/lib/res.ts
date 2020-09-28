import { Response } from 'express';
export function resErr(res: Response, code = 500, message: string, resultCode?: string) {
    return res.status(code).json({ code: resultCode, message: message });
}
