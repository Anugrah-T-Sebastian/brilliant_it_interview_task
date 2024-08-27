import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const updatePineconeIndex = async (
  client,
  indexName,
  docs,
  vectorDimension
) => {
  console.log("Retrieving Pinecone index");
  const index = await client.describeIndex(indexName);
  console.log("Retrieved Pinecone index:", index.name);
  for (const doc of docs) {
    console.log("Processing document", doc.metadata.source);
    const txtPath = doc.metadata.source;
    const txt = doc.pageContent;
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 1,
    });
    console.log("Splitting text into chunks");
    const chunks = await textSplitter.createDocuments([txt]);
    console.log("Text split into chunks:", chunks.length);
    console.log(`Calling OpenAI API for ${chunks.length} chunks`);
    console.log("API key:", process.env.OPENAI_API_KEY);
    try {
      const embeddingsArray = await new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        dimensions: vectorDimension,
        apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the environment
      }).embedDocuments(
        chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
      );
    } catch (error) {
      console.error("Failed to embed documents:", error);
      return;
    }
    console.log("Finished embedding documents");
    console.log(`Adding ${embeddings.length} embeddings to Pinecone index`);

    const batchSize = 100;
    let batch = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArray[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch.push(vector);
      // When the batch is full or its the last item, upsert the batch
      if (batch.length === batchSize || idx === chunks.length - 1) {
        await index.upsert({
          upsertRequest: {
            vectors: batch,
          },
        });
        // Clear the batch
        batch = [];
      }
    }

    console.log(`Pinecone index updated with ${chunks.length} vectors`);
  }
};
