import { Pinecone } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import { createPineconeIndex } from "./createPineconeIndex.js";
import { updatePineconeIndex } from "./updatePineconeIndex.js";
import { queryPineconeVectorStoreandQueryLLM } from "./queryPineconeAndQueryGPT.js";

dotenv.config();

const loader = new DirectoryLoader("./documents", {
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});

const docs = await loader.load();
console.log(`Loaded ${docs.length} documents`);
// console.log(docs[0]);

const question = "Who is the president of the United States?";
const index = "brilliant-it-interview-task";
const vectorDimension = 1536;

// const client = new pinecone.PineconeClient();
// await client.init({
//   apiKey: process.env.PINECONE_API_KEY,
// });
const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

(async () => {
  // await createPineconeIndex(client, index, vectorDimension);
  await updatePineconeIndex(client, index, docs);
  await queryPineconeVectorStoreandQueryLLM(
    client,
    index,
    question,
    vectorDimension
  );
})();
