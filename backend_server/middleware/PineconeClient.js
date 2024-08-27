const { Pinecone } = require("@pinecone-database/pinecone");

// const client = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY,
// });
// const indexName = "brilliant-it-interview-task";
// const vectorDimension = 1536;
// const existingIndexesObject = await client.listIndexes();

const addPineconeIndex = async (req, res, next) => {
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const indexName = "brilliant-it-interview-task";
  const vectorDimension = 1536;
  const existingIndexesObject = await client.listIndexes();
  //Check existing indexes
  const existingIndexes = existingIndexesObject.indexes.map(
    (index) => index.name
  );
  console.log("Existing indexes:", existingIndexes);
  if (!existingIndexes.includes(indexName)) {
    //Create index if it doesn't exist
    console.log(`Creating index ${indexName} with dimension ${dimension}`);
    try {
      await client.createIndex({
        name: indexName,
        dimension: vectorDimension,
        metric: "euclidean",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      console.log(`Index ${indexName} created`);
    } catch (error) {
      console.error(`Failed to create index ${indexName}: ${error}`);
    }
  }

  req.client = client;
  req.indexName = indexName;
  req.vectorDimension = vectorDimension;
  next();
};

module.exports = addPineconeIndex;
