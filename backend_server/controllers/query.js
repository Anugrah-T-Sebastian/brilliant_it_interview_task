const { StatusCodes } = require("http-status-codes");
const { OpenAIEmbeddings, OpenAI } = require("@langchain/openai");
const { loadQAStuffChain } = require("langchain/chains");
const { Document } = require("langchain/document");

// Query Pinecone index and query LLM
const queryPineconeVectorStoreandQueryLLM = async ({
  client,
  indexName,
  vectorName,
  question,
}) => {
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
    return {};
  } else {
    const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);

    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join("\n");

    const result = await chain.invoke({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });

    console.log(`Answer: ${result.text}`);
    return result;
  }
};

// Handle the query response
const queryResponse = async (req, res) => {
  const { question } = req.body;
  console.log("Received question:", question);
  try {
    const result = await queryPineconeVectorStoreandQueryLLM({
      client: req.client,
      indexName: req.indexName,
      question,
    });

    // const result = {
    //   res: {
    //     text: `The president said that Justice Breyer was an Army veteran, Constitutional scholar,
    // and retiring Justice of the United States Supreme Court and thanked him for his service.`,
    //   },
    // };

    res.status(StatusCodes.OK).json(result);
    return;
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = { queryResponse };
