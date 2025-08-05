import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Typography } from "@mui/material";
import {
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaFile,
  FaFolderOpen,
} from "react-icons/fa";

function DragDropComponent({ onFileSelect, mode = "excel-csv" }) {
  const [files, setFiles] = useState([]);

  const acceptConfig =
    mode === "excel-csv"
      ? {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "text/csv": [".csv"],
        }
      : {
          "application/pdf": [".pdf"],
        };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFiles(
        acceptedFiles.map((file) => ({
          file,
          preview: getFilePreview(file),
        }))
      );
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptConfig,
    maxSize: 52428800,
  });

  const getFilePreview = (file) => {
    const fileExtension = file.name?.split(".").pop()?.toLowerCase();
    switch (fileExtension) {
      case "xlsx":
        return <FaFileExcel className="text-green-500 size-8" />;
      case "csv":
        return <FaFileCsv className="text-yellow-400 size-8" />;
      case "pdf":
        return <FaFilePdf className="text-red-500 size-8" />;
      default:
        return <FaFile className="text-yellow-400 size-8" />;
    }
  };

  return (
    <div
      {...getRootProps({
        className:
          "flex flex-col items-center justify-center w-full p-8 border-4 border-dashed border-[#6C6C6C] rounded-lg cursor-pointer hover:bg-[#EEEEEE] transition-all duration-300 group",
      })}
    >
      <input {...getInputProps()} />
      <FaFolderOpen className="size-16 fill-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
      <Typography variant="body1" className="text-center">
        Haz clic para seleccionar un archivo o arrástralo aquí.
      </Typography>
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {files.map(({ file, preview }) => (
          <div
            key={file.name}
            className="flex items-center gap-4 bg-white p-2 rounded-lg animate-scale-in"
          >
            <div>{preview}</div>
            <Typography variant="body2" className="truncate w-32">
              {file.name}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DragDropComponent;
