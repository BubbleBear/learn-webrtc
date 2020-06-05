import Router from '@koa/router';

const router = new Router();

router.get('/hola', async (ctx, next) => {
    ctx.body = 'hola';

    return await next();
});

router.post('/api/(.*)', async (ctx, next) => {
    const path = ctx.request.path;
    const query = ctx.request.query;
    const body = ctx.request.body;

    console.log(body);

    const roomName = query.room;
    const userName = query.user;
    const offer = body.offer;
    const answer = body.answer;

    const response: { [prop: string]: any } = {
        success: true,
        path,
        query,
    };

    if (global.storage[roomName] === undefined) {
        global.storage[roomName] = {
            offer: undefined,
            answer: undefined,
        };
    }

    if (global.storage[roomName].offer === undefined && offer) {
        global.storage[roomName].offer = offer;
    }

    if (global.storage[roomName].answer === undefined && answer) {
        global.storage[roomName].answer = answer;
    }

    response.sdp = global.storage[roomName];

    ctx.body = response;

    return await next();
});

export default router;
