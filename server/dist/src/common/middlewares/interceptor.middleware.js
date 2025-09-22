export class Interceptor {
    ip;
    constructor(req, res, next){
        this.ip = req.ip ?? "";
    }
}
