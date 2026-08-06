import { AppDataSource } from "./config/db/data-source.js";
import { app } from "./app.js";
import { Environment } from "./config/env/environment.js";

const startServer = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();

    console.log("✅ Database connected.");

    app.listen(Environment.app.port, () => {
      console.log(
        `🚀 Server running at http://localhost:${Environment.app.port}`
      );
    });
  } catch (error) {
    console.error("❌ Error connecting to the database.");
    console.error(error);

    process.exit(1);
  }
};

startServer();