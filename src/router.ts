import Router from '@koa/router';

const router = new Router();

router.get('/hola', async (ctx, next) => {
    ctx.body = 'hola';

    return await next();
});

router.get('/api/:version/:controller/:method', async (ctx, next) => {
    const { version, controller, method } = ctx.params;

    ctx.body = await new (require(`./controllers/${version}/${controller}`).default)(ctx)[method]();

    return await next();
});

router.post('/api/:version/:controller/:method', async (ctx, next) => {
    const { version, controller, method } = ctx.params;

    ctx.body = await new (require(`./controllers/${version}/${controller}`).default)(ctx)[method]();

    return await next();
});

export default router;
