import React, { useState, useEffect } from "react";

function App() {
  const [selectedBank, setSelectedBank] = useState("BANAMEX");
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedExcel, setSelectedExcel] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [resultText, setResultText] = useState("");
  const [excelText, setExcelText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handlePDFChange = (e) => {
    setSelectedPDF(e.target.files[0]);
  };

  const handleExcelChange = (e) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedExcel(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResultText("");
    setLoading(true);

    if (!selectedBank) {
      setError("Por favor, selecciona un banco válido.");
      setLoading(false);
      return;
    }

    if (!selectedPDF) {
      setError("Por favor, selecciona un archivo válido");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedPDF);
    formData.append("bank", selectedBank);

    try {
      const response = await fetch("http://localhost:8000/convert_pdf/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();
      setExtractedText(data);

      const secondResponse = await fetch("http://localhost:8000/api/new/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await secondResponse.json();
      setResultText(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    setError(null);
    setExcelText("");
    setLoading(true);

    if (!selectedExcel) {
      setError("Por favor, selecciona un archivo válido");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedExcel);

    try {
      const response = await fetch("http://localhost:8000/convert_csv/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();
      setExcelText(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
    } finally {
      setLoading(false);
    }
  };

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
              {selectedPDF ? selectedPDF.name : "Subir"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePDFChange}
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
        <div className="relative h-full w-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-700"></div>
            </div>
          )}
          <textarea
            readOnly
            value={resultText}
            disabled
            className="w-full h-full bg-slate-100 rounded-md border-4 border-blue-700 p-2"
          ></textarea>
        </div>
      </div>

      {/* Red */}
      <div className="flex flex-col bg-red-500 border-4 border-red-700 h-screen p-4">
        <div className="flex mb-8 justify-evenly">
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              4. Selecciona un archivo.
            </p>
            <label className="w-1/2 p-2 cursor-pointer bg-red-700 text-white font-bold text-center rounded-lg hover:bg-red-500">
              {selectedExcel ? selectedExcel.name : "Subir"}
              <input
                type="file"
                accept=".csv, text/csv"
                onChange={handleExcelChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-col space-y-4 items-center">
            <p className="mt-2 text-white text-xl font-semibold">
              5. Inicia la comparación.
            </p>
            <button
              onClick={handleCompare}
              className="w-1/2 p-2 bg-red-700 text-white font-bold text-center rounded-lg hover:bg-red-500"
            >
              Iniciar
            </button>
          </div>
        </div>
        <div className="relative h-full w-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-700"></div>
            </div>
          )}
          <textarea
            readOnly
            value={excelText}
            disabled
            className="h-full w-full bg-slate-100 rounded-md border-4 border-red-700"
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default App;
