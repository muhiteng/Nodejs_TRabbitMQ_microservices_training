import * as express from "express";
import * as cors from "cors";
const PORT = 8000;
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json());
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
