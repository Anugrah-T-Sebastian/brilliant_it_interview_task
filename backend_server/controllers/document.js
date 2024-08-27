const path = require("path");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination for uploaded files
    cb(null, path.join(__dirname, "../uploaded_documents"));
  },
  filename: (req, file, cb) => {
    // Set the file name, keeping the original name
    cb(null, file.originalname);
  },
});

// File filter to only accept PDF, DOCX, and TXT files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOCX, and TXT files are allowed!"), false);
  }
};

// Initialize multer with the storage configuration and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Update Pinecone index with the embeddings of the uploaded document
const updatePineconeIndex = async ({
  filePath,
  client,
  indexName,
  vectorDimension,
}) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  console.log("File extension:", fileExtension);
  let loader;
  if (fileExtension === ".txt") {
    loader = new TextLoader(filePath);
  } else if (fileExtension === ".pdf") {
    loader = new PDFLoader(filePath);
  } else {
    throw new Error("Unsupported file type");
  }
  const docs = await loader.load();

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
    let embeddingsArray;
    try {
      embeddingsArray = await new OpenAIEmbeddings({
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

// Controller to handle file upload
const uploadFile = async (req, res) => {
  console.log("Got file upload request");
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }
    console.log("File uploaded successfully", req.file);
    try {
      console.log("Updating Pinecone index");
      await updatePineconeIndex({
        filePath: req.file.path,
        // Pass any other necessary information like client, indexName, vectorDimension, etc.
        client: req.client, // Example: Add client object to request in middleware or set it before
        indexName: req.indexName,
        vectorDimension: req.vectorDimension,
      });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: error.message });
      return;
    }

    // If file upload is successful
    res
      .status(StatusCodes.OK)
      .send({ message: "File uploaded successfully!", file: req.file });
  });
};

module.exports = { uploadFile };
