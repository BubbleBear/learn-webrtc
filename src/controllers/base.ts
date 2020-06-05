import { Context } from 'koa';

export default abstract class BaseController {
    protected ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }
}
