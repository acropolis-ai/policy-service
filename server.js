const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const RateTable = require('./RateTable');
const rt = new RateTable(require('./rate-table'));

app.post('/rate', (req, res) => {
  res.json(rt.getRates(req.body));
});

app.listen(process.env.PORT || 8080, () => {
  console.log('listening');
});
