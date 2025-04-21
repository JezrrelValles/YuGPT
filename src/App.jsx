import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import CircleIcon from "@mui/icons-material/Circle";
import DragDropComponent from "./components/DragDropComponent";
import Navbar from "./components/Navbar";
import { Download, Refresh } from "@mui/icons-material";

function App() {
  const [selectedBank, setSelectedBank] = useState("BANAMEX");
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedExcel, setSelectedExcel] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [resultText, setResultText] = useState("");
  const [excelText, setExcelText] = useState("");
  const [previousText, setPreviousText] = useState("");
  const [comparisonResult, setComparisonResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAux, setLoadingAux] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [differences, setDifferences] = useState("");
  const [stepOne, setStepOne] = useState(false);
  const [stepTwo, setStepTwo] = useState(false);
  const [stepThree, setStepThree] = useState(false);
  const [stepFour, setStepFour] = useState(false);
  const [stepFive, setStepFive] = useState(false);
  const [stepSix, setStepSix] = useState(false);
  const [stepSeven, setStepSeven] = useState(false);
  const [stepEight, setStepEight] = useState(false);
  const [selectedPrevious, setSelectedPrevious] = useState(null);

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handlePDFChange = (file) => {
    setSelectedPDF(file);
    setStepOne(true);
    setStepTwo(true);
  };

  const handleExcelChange = (file) => {
    setSelectedExcel(file);
    setStepFour(true);
  };

  const handlePrevious = (file) => {
    setSelectedPrevious(file);
    setStepSix(true);
  };

  const normalizeCsvTransactions = (csvTransactions) => {
    return csvTransactions.map((t) => {
      // Verificar si los campos son nulos o están vacíos
      const abonos = t.Abonos ? t.Abonos.replace(/,/g, "") : "0";
      const cargos = t.Cargos ? t.Cargos.replace(/,/g, "") : "0";
      const saldo = t.Saldo ? t.Saldo.replace(/,/g, "") : "0";

      // Determinar el tipo de transacción
      const tipo = t.Abonos ? "deposito" : "retiro";

      // Convertir a números
      const monto = parseFloat(abonos) || parseFloat(cargos);
      const saldoNum = parseFloat(saldo);

      return {
        fecha: t.Fecha ? t.Fecha.toUpperCase() : "FECHA_DESCONOCIDA", // Manejar fechas nulas
        tipo: tipo,
        monto: monto,
        saldo: saldoNum,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultText("");

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
      const response = await fetch("http://localhost:8000/extract_pdf/", {
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

      if (!secondResponse.ok) {
        throw new Error(
          "Error al procesar los datos con el asistente inteligente."
        );
      }

      const result = await secondResponse.json();

      if (result.assistant_transactions) {
        const pdfTransactions = JSON.parse(
          result.assistant_transactions
        ).transactions;
        setResultText(JSON.stringify(pdfTransactions, null, 2));
      } else {
        throw new Error("No se encontraron transacciones en la respuesta");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
    } finally {
      setLoading(false);
      setStepThree(true);
    }
  };

  const handleSubmitAux = async (e) => {
    e.preventDefault();
    setLoadingAux(true);
    setError(null);
    setExcelText("");

    if (!selectedExcel) {
      setError("Por favor, selecciona un archivo válido");
      setLoadingAux(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedExcel);

    try {
      const response = await fetch("http://localhost:8000/extract_aux/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();

      if (data.aux_transactions) {
        const csvTransactions = data.aux_transactions;
        setExcelText(JSON.stringify(csvTransactions, null, 2));
      } else {
        throw new Error("No se encontraron transacciones");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
    } finally {
      setLoadingAux(false);
      setStepFive(true);
    }
  };

  const handleSubmitPrevious = async (e) => {
    e.preventDefault();
    setLoadingPrevious(true);
    setError(null);
    setPreviousText("");

    if (!selectedPrevious) {
      setError("Por favor, selecciona un archivo válido");
      setLoadingPrevious(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedPrevious);

    try {
      const response = await fetch("http://localhost:8000/extract_previous/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();

      if (data.previous_transactions) {
        const previousTransactions = data.previous_transactions;
        setPreviousText(JSON.stringify(previousTransactions, null, 2));
      } else {
        throw new Error("No se encontraron transacciones");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
    } finally {
      setLoadingPrevious(false);
      setStepSeven(true);
    }
  };

  const handleVerify = async () => {
    setLoadingComparison(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 30000)); // Espera 30 segundos

      const response = await fetch(
        "http://127.0.0.1:8000/create_conciliation/",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Error al generar el archivo");
      }

      // Convertir la respuesta a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace para descargar el archivo
      const a = document.createElement("a");
      a.href = url;
      a.download = "CONCILIACION_MARZO_2025.xlsx"; // Nombre del archivo
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingComparison(false);
      setStepEight(true);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/create_conciliation/",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Error al generar el archivo");
      }

      // Convertir la respuesta a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace para descargar el archivo
      const a = document.createElement("a");
      a.href = url;
      a.download = "CONCILIACION_MARZO_2025.xlsx"; // Nombre del archivo
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleCopyDifferences = async () => {
    if (!differences) return;

    try {
      await navigator.clipboard.writeText(differences);
      alert("Texto copiado al portapapeles");
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleCleanDifferences = () => {
    setDifferences("");
  };

  const handleCopyExcel = async () => {
    if (!excelText) return;

    try {
      await navigator.clipboard.writeText(excelText);
      alert("Texto copiado al portapapeles");
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleCleanExcel = () => {
    setSelectedExcel(null);
    setExcelText("");
  };

  const handleCopyPDF = async () => {
    if (!resultText) return;

    try {
      await navigator.clipboard.writeText(resultText);
      alert("Texto copiado al portapapeles");
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleCleanPDF = () => {
    setSelectedPDF(null);
    setSelectedBank("BANAMEX");
    setResultText("");
  };

  useEffect(() => {
    console.log("Estado limpiado:", {
      selectedPDF,
      selectedBank,
      resultText,
      selectedExcel,
      excelText,
      selectedPrevious,
      previousText,
      differences,
    });
  }, [
    selectedPDF,
    selectedBank,
    resultText,
    selectedExcel,
    excelText,
    selectedPrevious,
    previousText,
    differences,
  ]);

  return (
    <div className="h-full w-full bg-[#EEEEEE]">
      <Navbar />
      <div className="flex justify-center p-4 mt-4 mx-4 rounded-lg bg-white">
        <Typography variant="h4" component="h1">
          Conciliación de Estados de Cuenta
        </Typography>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4 h-full rounded-lg">
        {/* Estado de Cuenta */}
        <div className="bg-white">
          <Accordion expanded={true}>
            <AccordionSummary aria-controls="panel1-content" id="panel1-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepOne ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    1
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Estado de cuenta
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-col p-4 gap-4">
                <DragDropComponent onFileSelect={handlePDFChange} mode="pdf" />
                <Typography
                  variant="subtitle2"
                  className="text-black text-center"
                >
                  * El formato permitido es .PDF
                </Typography>
                {/* <label className="w-1/2 p-2 cursor-pointer bg-blue-700 text-white font-bold text-center rounded-lg hover:bg-blue-500">
                  {selectedPDF ? selectedPDF.name : "Subir"}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePDFChange}
                    className="hidden"
                  />
                </label> */}
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepOne}>
            <AccordionSummary aria-controls="panel2-content" id="panel2-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepTwo ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    2
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Banco
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-col justify-center items-center gap-4 p-4">
                <Typography variant="body1" component="span">
                  Selecciona el banco al que corresponde el estado de cuenta.
                </Typography>
                <form onSubmit={handleSubmit}>
                  <select
                    value={selectedBank}
                    className="p-2 bg-[#EEEEEE] border-4 border-blue-500 rounded-md font-bold shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
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
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepTwo}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepThree ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    3
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Extracción
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {loading && (
                <div className="relative min-h-32 w-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                </div>
              )}
              {/* <textarea
                  readOnly
                  value={resultText}
                  disabled
                  className="w-full min-h-64 rounded-lg border-4 border-blue-500 p-4"
                ></textarea> */}
              <div className="flex justify-center">
                {/* <Button variant="outlined" onClick={handleCleanPDF}>
                <CleaningServices />
              </Button> */}
                {/* <Button variant="outlined" onClick={handleCopyPDF}>
                <ContentPaste />
              </Button> */}
                {!stepThree && (
                  <Button
                    variant="contained"
                    disabled={loading ? true : false}
                    onClick={handleSubmit}
                    className="w-1/2 bg-blue-500 text-center hover:bg-blue-500"
                  >
                    {loading ? "Cargando..." : "Iniciar"}
                  </Button>
                )}
                {stepThree && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <CircleIcon className="text-green-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✔
                      </Typography>
                    </div>
                    <Typography>Extracción realizada con éxito.</Typography>
                    <Typography variant="caption">Avanza al Paso 4 para continuar con el proceso.</Typography>
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Auxiliar */}
        <div className="bg-white">
          <Accordion expanded={stepThree}>
            <AccordionSummary aria-controls="panel1-content" id="panel1-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepFour ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    4
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Auxiliar
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-col p-4 gap-4">
                <DragDropComponent
                  onFileSelect={handleExcelChange}
                  mode="excel-csv"
                />
                <Typography
                  variant="subtitle2"
                  className="text-black text-center"
                >
                  * El formato permitido es .XSLX
                </Typography>
              </div>
              {/* <label className="w-1/2 p-2 cursor-pointer bg-red-700 text-white font-bold text-center rounded-lg hover:bg-red-500">
                  {selectedExcel ? selectedExcel.name : "Subir"}
                  <input
                    type="file"
                    accept=".csv, text/csv"
                    onChange={handleExcelChange}
                    className="hidden"
                  />
                </label> */}
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepFour}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepFive ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    5
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Extracción
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {loadingAux && (
                <div className="relative min-h-32 w-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                </div>
              )}
              {/* <textarea
                  readOnly
                  value={excelText}
                  disabled
                  className="min-h-64 w-full rounded-lg border-4 border-red-500 p-4"
                ></textarea> */}
              <div className="flex justify-center">
                {!stepFive && (
                  <Button
                    variant="contained"
                    disabled={loadingAux ? true : false}
                    onClick={handleSubmitAux}
                    className="w-1/2 bg-blue-500 text-center hover:bg-blue-500"
                  >
                    {loadingAux ? "Cargando..." : "Iniciar"}
                  </Button>
                )}
                {stepFive && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <CircleIcon className="text-green-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✔
                      </Typography>
                    </div>
                    <Typography>Extracción realizada con éxito.</Typography>
                    <Typography variant="caption">Avanza al Paso 6 para continuar con el proceso.</Typography>
                  </div>
                )}

                {/* <Button variant="outlined" onClick={handleCleanExcel}>
                <CleaningServices />
              </Button> */}
                {/* <Button variant="outlined" onClick={handleCopyExcel}>
                <ContentPaste />
              </Button> */}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Conciliación Previa */}
        <div className="bg-white">
          <Accordion expanded={stepFive}>
            <AccordionSummary aria-controls="panel1-content" id="panel1-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepSix ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    6
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Conciliación previa
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-col p-4 gap-4">
                <DragDropComponent
                  onFileSelect={handlePrevious}
                  mode="excel-csv"
                />
                <Typography
                  variant="subtitle2"
                  className="text-black text-center"
                >
                  * El formato permitido es .XSLX
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepSix}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepSeven ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    7
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Extracción
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {loadingPrevious && (
                <div className="relative min-h-32 w-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                </div>
              )}
              {/* <textarea
                  readOnly
                  value={excelText}
                  disabled
                  className="min-h-64 w-full rounded-lg border-4 border-red-500 p-4"
                ></textarea> */}
              <div className="flex justify-center">
                {/* <Button variant="outlined" onClick={handleCleanExcel}>
                <CleaningServices />
              </Button> */}
                {/* <Button variant="outlined" onClick={handleCopyExcel}>
                <ContentPaste />
              </Button> */}
                {!stepSeven && (
                  <Button
                    variant="contained"
                    disabled={loadingPrevious ? true : false}
                    onClick={handleSubmitPrevious}
                    className="w-1/2 bg-blue-500 text-center hover:bg-blue-500"
                  >
                    {loadingPrevious ? "Cargando..." : "Iniciar"}
                  </Button>
                )}
                {stepSeven && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <CircleIcon className="text-green-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✔
                      </Typography>
                    </div>
                    <Typography>Extracción realizada con éxito.</Typography>
                    <Typography variant="caption">Avanza al Paso 8 para completar el proceso.</Typography>
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Conciliación Actual */}
        <div className="bg-white">
          <Accordion expanded={stepSeven}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon
                    className={stepEight ? "text-green-500" : "text-gray-400"}
                    fontSize="large"
                  />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    8
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Conciliación actual
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {loadingComparison && (
                <div className="relative min-h-32 w-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                </div>
              )}
              {/* <textarea
                  readOnly
                  value={differences}
                  disabled
                  className="w-full min-h-64 rounded-md border-4 border-purple-700 p-4"
                ></textarea> */}
              <div className="flex gap-4 justify-center">
                {!stepEight && (
                  <Button
                    variant="contained"
                    disabled={loadingComparison ? true : false}
                    className="w-1/2 p-2 bg-blue-500 hover:bg-blue-700"
                    onClick={handleVerify}
                  >
                    Generar
                  </Button>
                )}
                {stepEight && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                      <div className="relative">
                        <CircleIcon
                          className="text-green-500"
                          fontSize="large"
                        />
                        <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                          ✔
                        </Typography>
                      </div>
                      <Typography>Conciliación realizada con éxito.</Typography>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outlined" className="flex gap-4">
                        REINICIAR
                        <Refresh onClick={handleReset} />
                      </Button>
                      <Button variant="contained" className="flex gap-4">
                        Descargar
                        <Download onClick={handleDownload} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default App;
