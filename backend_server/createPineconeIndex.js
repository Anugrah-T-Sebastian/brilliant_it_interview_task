export const createPineconeIndex = async (client, indexName, dimension) => {
  const existingIndexesObject = await client.listIndexes();
  const existingIndexes = existingIndexesObject.indexes.map(
    (index) => index.name
  );
  console.log("Existing indexes:", existingIndexes);
  if (!existingIndexes.includes(indexName)) {
    console.log(`Creating index ${indexName} with dimension ${dimension}`);
    try {
      await client.createIndex({
        name: indexName,
        dimension: dimension, // Replace with your model dimensions
        metric: "euclidean", // Replace with your model metric
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
};
