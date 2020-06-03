import Router from '@koa/router';

const router = new Router();

router.get('/hola', async (ctx, next) => {
    ctx.body = 'hola';

    return await next();
});

router.get('/api/(.*)', async (ctx, next) => {
    ctx.body = 'hola';
    
    const path = ctx.request.path;

    return await next();
});

export default router;
