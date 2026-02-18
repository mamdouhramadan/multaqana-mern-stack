const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello'));

const server = app.listen(5002, () => {
  console.log('Debug server running on 5002');
});

// Keep process alive just in case (though app.listen should do it)
setInterval(() => { }, 1000);
