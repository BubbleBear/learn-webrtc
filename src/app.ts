import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';

import router from './router';

const PORT = process.env.PORT || 9999;

const app = new Koa();

app.use(serve('public'));

app.use(bodyParser());

app.use(router.routes());

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
