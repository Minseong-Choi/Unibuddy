const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

// 간단한 GET 요청 처리
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the Express server!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
