import React, { useState, useEffect } from "react";

function App() {
  const [selectedBank, setSelectedBank] = useState("BANAMEX");
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [error, setError] = useState(null);

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedBank) {
      setError("Por favor, selecciona un banco válido.");
      return;
    }

    if (!selectedFile) {
      setError("Por favor, selecciona un archivo válido");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("bank", selectedBank);

    try {
      const response = await fetch("http://localhost:8000/convert_pdf/", {
      method: "POST",
      body: formData,
    });
    const data = await response.json()
    setExtractedText(data)
    
    const secondResponse = await fetch("http://localhost:8000/api/new/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await secondResponse.json();
      console.log("Result", result);

    } catch (error) {
      console.error("Error: ", error);
    }    
  };


  useEffect(() => {
    if (extractedText !== null) {
      console.log("Estado actualizado", extractedText);
    }
  }, [extractedText]);

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Blue */}
      <div className="flex flex-col bg-blue-500 h-screen border-4 border-blue-700 p-4">
        <div className="flex mb-8 justify-evenly">
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              1. Selecciona un archivo.
            </p>
            <label className="w-1/2 p-2 cursor-pointer bg-blue-700 text-white font-bold text-center rounded-lg hover:bg-blue-500">
              {selectedFile ? selectedFile.name : "Subir"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              2. Selecciona un banco.
            </p>
            <form onSubmit={handleSubmit}>
              <select
                className="p-2 bg-blue-700 border border-blue-700 rounded-md text-white font-bold shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                name="options"
                id="options"
                onChange={handleBankChange}
              >
                <option value="BANAMEX">BANAMEX</option>
                <option value="BANBAJIO">BANBAJIO</option>
                <option value="BANORTE">BANORTE</option>
                <option value="BANREGIO">BANREGIO</option>
                <option value="BBVA">BBVA</option>
                <option value="BX+">BX+</option>
                <option value="CHASE">CHASE</option>
                <option value="HSBC">HSBC</option>
                <option value="SANTANDER">SANTANDER</option>
                <option value="SCOTIABANK">SCOTIABANK</option>
              </select>
            </form>
          </div>
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              3. Inicia la extracción.
            </p>
            <button
              onClick={handleSubmit}
              className="w-1/2 p-2 bg-blue-700 text-white font-bold text-center rounded-lg hover:bg-blue-500"
            >
              Iniciar
            </button>
          </div>
        </div>
        <textarea
          readOnly
          disabled
          className="h-screen bg-slate-100 rounded-md border-4 border-blue-700"
        ></textarea>
      </div>

      {/* Red */}
      <div className="flex flex-col bg-red-500 border-4 border-red-700 h-screen p-4">
        <div className="flex mb-8 justify-evenly">
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              4. Selecciona un archivo.
            </p>
            <label className="w-1/2 p-2 cursor-pointer bg-red-700 text-white font-bold text-center rounded-lg hover:bg-red-500">
              Subir
              <input type="file" className="hidden" />
            </label>
          </div>
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              5. Inicia la comparación.
            </p>
            <button className="w-1/2 p-2 bg-red-700 text-white font-bold text-center rounded-lg hover:bg-red-500">
              Iniciar
            </button>
          </div>
        </div>
        <textarea
          readOnly
          disabled
          className="h-screen bg-slate-100 rounded-md border-4 border-red-700"
        ></textarea>
      </div>
    </div>
  );
}

export default App;
