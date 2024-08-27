import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";

export const queryPineconeVectorStoreandQueryLLM = async (
  client,
  indexName,
  question
) => {
  console.log("Retrieving Pinecone index");
  const index = await client.index(indexName);
  const queryEmbeddings = await new OpenAIEmbeddings().embedQuery(question);
  let queryResponse = await index.query({
    queryRequest: {
      topK: 10,
      vector: queryEmbeddings,
      includeMetadata: true,
      includeValues: true,
    },
  });
  console.log(`Found ${queryResponse.matches.length} matches...`);
  console.log(`Asking question ${question}`);

  if (queryResponse.matches.length === 0) {
    console.log("No matches found");
    return;
  } else {
    const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);

    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join("\n");

    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });

    console.log(`Answer: ${result.text}`);
  }
};
