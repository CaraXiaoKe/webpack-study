const Koa = require('koa');
const app = new Koa();
app.use(require('koa-static')(__dirname + '/build'))
app.listen(9000);