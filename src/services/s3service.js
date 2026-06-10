import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Subir archivo
export async function uploadFile(filePath, bucketName, key) {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("Archivo subido correctamente:", key);
  } catch (error) {
    console.error("Error al subir archivo:", error);
  }
}

// Descargar archivo
export async function downloadFile(bucketName, key, downloadPath) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const stream = response.Body;
    const writeStream = fs.createWriteStream(downloadPath);
    stream.pipe(writeStream);
    console.log("Archivo descargado en:", downloadPath);
  } catch (error) {
    console.error("Error al descargar archivo:", error);
  }
}
