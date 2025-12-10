import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import DragDropComponent from "./components/DragDropComponent";
import Navbar from "./components/Navbar";
import {
  Download,
  Refresh,
  AutoAwesome,
  Circle,
  PlayArrow,
} from "@mui/icons-material";

function App() {
  const [selectedBank, setSelectedBank] = useState("BANAMEX");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAux, setSelectedAux] = useState(null);
  const [extractedText, setExtractedAccount] = useState("");
  const [assistantResult, setAssistantResult] = useState("");
  const [auxResult, setAuxResult] = useState("");
  const [compareResult, setCompareResult] = useState("");
  const [selectedPreviousConciliation, setSelectedPreviousConciliation] =
    useState(null);
  const [previousConciliationResult, setPreviousConciliationResult] =
    useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAux, setLoadingAux] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [loadingConciliation, setLoadingConciliation] = useState(false);
  const [stepOne, setStepOne] = useState(false);
  const [stepTwo, setStepTwo] = useState(false);
  const [stepThree, setStepThree] = useState(false);
  const [stepFour, setStepFour] = useState(false);
  const [stepFive, setStepFive] = useState(false);
  const [stepSix, setStepSix] = useState(false);
  const [stepSeven, setStepSeven] = useState(false);
  const [stepEight, setStepEight] = useState(false);
  const [resetAux, setResetAux] = useState(0);
  const [resetAccount, setResetAccount] = useState(0);
  const [resetPrev, setResetPrev] = useState(0);
  const [errorAssistant, setErrorAssistant] = useState(false);
  const [errorAux, setErrorAux] = useState(false);
  const [errorPrev, setErrorPrev] = useState(false);
  const [errorConciliation, setErrorConciliation] = useState(false);
  const [conciliationFileUrl, setConciliationFileUrl] = useState(null);

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handleAccountChange = (file) => {
    setSelectedAccount(file);
    setStepOne(true);
    setStepTwo(true);
  };

  const handleAuxChange = (file) => {
    setSelectedAux(file);
    setStepFour(true);
  };

  const handlePreviousConciliation = (file) => {
    setSelectedPreviousConciliation(file);
    setStepSix(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAssistantResult("");
    setErrorAssistant(false);

    if (!selectedBank) {
      setError("Por favor, selecciona un banco válido.");
      setLoading(false);
      return;
    }

    if (!selectedAccount) {
      setError("Por favor, selecciona un archivo válido");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedAccount);
    formData.append("bank", selectedBank);

    try {
      const extractAccountUrl = "/extract_account/";
      const response = await fetch(extractAccountUrl,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();
      setExtractedAccount(data);
      
      const executionUrl = "/api/new/";
      const secondResponse = await fetch(
        executionUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

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
        setAssistantResult(JSON.stringify(pdfTransactions, null, 2));
        setStepThree(true);
      } else {
        throw new Error("No se encontraron transacciones en la respuesta");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
      setErrorAssistant(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAux = async (e) => {
    e.preventDefault();
    setLoadingAux(true);
    setError(null);
    setAuxResult("");
    setErrorAux(false);

    if (!selectedAux) {
      setError("Por favor, selecciona un archivo válido");
      setLoadingAux(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedAux);

    try {
      const extractAuxUrl = "/extract_aux/";
      const response = await fetch(extractAuxUrl,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();

      if (data.aux_transactions) {
        const csvTransactions = data.aux_transactions;
        setAuxResult(JSON.stringify(csvTransactions, null, 2));
        setStepFive(true);
      } else {
        throw new Error("No se encontraron transacciones");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
      setErrorAux(true);
    } finally {
      setLoadingAux(false);
    }
  };

  const handleSubmitPrevious = async (e) => {
    e.preventDefault();
    setLoadingPrevious(true);
    setError(null);
    setPreviousConciliationResult("");
    setErrorPrev(false);

    if (!selectedPreviousConciliation) {
      setError("Por favor, selecciona un archivo válido");
      setLoadingPrevious(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedPreviousConciliation);

    try {
      const extractPreviousUrl = "/extract_previous/";
      const response = await fetch(extractPreviousUrl,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      const data = await response.json();

      if (data.previous_transactions) {
        const previousTransactions = data.previous_transactions;
        setPreviousConciliationResult(
          JSON.stringify(previousTransactions, null, 2)
        );
        setStepSeven(true);
      } else {
        throw new Error("No se encontraron transacciones");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Error al procesar el archivo.");
      setErrorPrev(true);
    } finally {
      setLoadingPrevious(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoadingConciliation(true);
    setErrorConciliation(false);

    let prevResultParsed;
    let auxResultParsed;
    let assistantResultParsed;

    try {
      prevResultParsed =
        typeof previousConciliationResult === "string"
          ? JSON.parse(previousConciliationResult)
          : previousConciliationResult;
    } catch (e) {
      console.log("Error al parsear");
      setLoadingConciliation(false);
      setErrorConciliation(true);

      return;
    }

    try {
      auxResultParsed =
        typeof auxResult === "string" ? JSON.parse(auxResult) : auxResult;
    } catch (e) {
      console.log("Error al parsear");
      setLoadingConciliation(false);
      setErrorConciliation(true);

      return;
    }

    try {
      assistantResultParsed =
        typeof assistantResult === "string"
          ? JSON.parse(assistantResult)
          : assistantResult;
    } catch (e) {
      console.log("Error al parsear");
      setLoadingConciliation(false);
      setErrorConciliation(true);

      return;
    }

    const data = {
      previousConciliationResult: prevResultParsed,
      auxResult: auxResultParsed,
      assistantResult: assistantResultParsed,
    };

    try {
      const conciliationUrl = "/create_conciliation/";
      const response = await fetch(conciliationUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Error al generar el archivo");
      }

      // Convertir la respuesta a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setConciliationFileUrl(url);

      // Crear un enlace para descargar el archivo
      const a = document.createElement("a");
      a.href = url;
      a.download = "CONCILIACION.xlsx"; // Nombre del archivo
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStepEight(true);
    } catch (error) {
      console.error("Error:", error);
      setErrorConciliation(true);
    } finally {
      setLoadingConciliation(false);
    }
  };

  const handleDownload = () => {
    if (!conciliationFileUrl) {
      console.error("No hay archivo para descargar.");
      return;
    }

    const a = document.createElement("a");
    a.href = conciliationFileUrl;
    a.download = "CONCILIACION.xlsx"; // Nombre del archivo
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleResetConciliation = () => {
    setStepEight(false);
    setErrorConciliation(false);
  };

  const handleResetAccount = () => {
    setAssistantResult(null);
    setSelectedAccount(null);
    setStepOne(false);
    setStepTwo(false);
    setStepThree(false);
    setErrorAssistant(false);
    setResetAccount((prev) => prev + 1);
  };

  const handleResetAux = () => {
    setAuxResult(null);
    setSelectedAux(null);
    setStepFour(false);
    setStepFive(false);
    setErrorAux(false);
    setResetAux((prev) => prev + 1);
  };

  const handleResetPrev = () => {
    setPreviousConciliationResult(null);
    setSelectedPreviousConciliation(null);
    setStepSix(false);
    setStepSeven(false);
    setErrorPrev(false);
    setResetPrev((prev) => prev + 1);
  };

  useEffect(() => {
    console.log("Estado:", {
      selectedPDF: selectedAccount,
      selectedBank,
      resultText: assistantResult,
      selectedExcel: selectedAux,
      excelText: auxResult,
      selectedPrevious: selectedPreviousConciliation,
      previousText: previousConciliationResult,
    });
  }, [
    selectedAccount,
    selectedBank,
    assistantResult,
    selectedAux,
    auxResult,
    selectedPreviousConciliation,
    previousConciliationResult,
  ]);

  return (
    <div className="h-screen w-full bg-[#EEEEEE]">
      <Navbar />
      <div className="flex justify-center p-4 m-4 rounded-lg bg-white">
        <Typography variant="h4" component="h1">
          Conciliación de Estados de Cuenta
        </Typography>
      </div>
      <div className="grid grid-cols-4 gap-4 m-4">
        {/* Estado de Cuenta */}
        <div className="bg-white rounded-lg">
          <Accordion expanded={true}>
            <AccordionSummary aria-controls="panel1-content" id="panel1-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
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
                <DragDropComponent
                  key={resetAccount}
                  onFileSelect={handleAccountChange}
                  mode="pdf"
                />
                <Typography
                  variant="subtitle2"
                  className="text-black text-center"
                >
                  Solo se permiten archivos .PDF (máx. 50 MB).
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepOne}>
            <AccordionSummary aria-controls="panel2-content" id="panel2-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
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
                  <Circle
                    className={
                      stepThree && !errorAssistant
                        ? "text-green-500"
                        : errorAssistant
                        ? "text-red-500"
                        : "text-gray-400"
                    }
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
              <div className="flex justify-center">
                {!stepThree && !errorAssistant && (
                  <Button
                    variant="contained"
                    disabled={loading ? true : false}
                    onClick={handleSubmit}
                    className="flex gap-1 w-1/2 bg-blue-500 text-center hover:bg-blue-500"
                  >
                    {loading ? (
                      <>Cargando...</>
                    ) : (
                      <>
                        <PlayArrow />
                        Iniciar
                      </>
                    )}
                  </Button>
                )}
                {errorAssistant && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-red-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✖
                      </Typography>
                    </div>
                    <Typography>Error al realizar extracción</Typography>
                    <Typography variant="caption">Intenta de nuevo.</Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetAccount}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
                {stepThree && !errorAssistant && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-green-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✔
                      </Typography>
                    </div>
                    <Typography>Extracción realizada con éxito.</Typography>
                    <Typography variant="caption">
                      Avanza al Paso 4 para continuar con el proceso.
                    </Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetAccount}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Auxiliar */}
        <div className="bg-white rounded-lg">
          <Accordion expanded={stepThree}>
            <AccordionSummary aria-controls="panel1-content" id="panel1-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
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
                  key={resetAux}
                  onFileSelect={handleAuxChange}
                  mode="excel-csv"
                />
                <Typography
                  variant="subtitle2"
                  className="text-black text-center"
                >
                  Solo se permiten archivos .XSLX (máx. 50 MB).
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepFour}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
                    className={
                      stepFive && !errorAux
                        ? "text-green-500"
                        : errorAux
                        ? "text-red-500"
                        : "text-gray-400"
                    }
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
              <div className="flex justify-center">
                {!stepFive && !errorAux && (
                  <Button
                    variant="contained"
                    disabled={loadingAux ? true : false}
                    onClick={handleSubmitAux}
                    className="flex gap-1 w-1/2 bg-blue-500 text-center hover:bg-blue-500"
                  >
                    {loadingAux ? (
                      <>Cargando...</>
                    ) : (
                      <>
                        <PlayArrow />
                        Iniciar
                      </>
                    )}
                  </Button>
                )}
                {errorAux && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-red-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✖
                      </Typography>
                    </div>
                    <Typography>Error al realizar extracción</Typography>
                    <Typography variant="caption">Intenta de nuevo.</Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetAux}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
                {stepFive && !errorAux && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-green-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✔
                      </Typography>
                    </div>
                    <Typography>Extracción realizada con éxito.</Typography>
                    <Typography variant="caption">
                      Avanza al Paso 6 para continuar con el proceso.
                    </Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetAux}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Conciliación Previa */}
        <div className="bg-white rounded-lg">
          <Accordion expanded={stepFive}>
            <AccordionSummary aria-controls="panel1-content" id="panel1-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
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
                  key={resetPrev}
                  onFileSelect={handlePreviousConciliation}
                  mode="excel-csv"
                />
                <Typography
                  variant="subtitle2"
                  className="text-black text-center"
                >
                  Solo se permiten archivos .XSLX (máx. 50 MB).
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={stepSix}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
                    className={
                      stepSeven && !errorPrev
                        ? "text-green-500"
                        : errorPrev
                        ? "text-red-500"
                        : "text-gray-400"
                    }
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
              <div className="flex justify-center">
                {!stepSeven && !errorPrev && (
                  <Button
                    variant="contained"
                    disabled={loadingPrevious ? true : false}
                    onClick={handleSubmitPrevious}
                    className="flex gap-1 w-1/2 bg-blue-500 text-center hover:bg-blue-500"
                  >
                    {loadingPrevious ? (
                      <>Cargando...</>
                    ) : (
                      <>
                        <PlayArrow />
                        Iniciar
                      </>
                    )}
                  </Button>
                )}
                {errorPrev && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-red-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✖
                      </Typography>
                    </div>
                    <Typography>Error al realizar extracción</Typography>
                    <Typography variant="caption">Intenta de nuevo.</Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetPrev}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
                {stepSeven && !errorPrev && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-green-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✔
                      </Typography>
                    </div>
                    <Typography>Extracción realizada con éxito.</Typography>
                    <Typography variant="caption">
                      Avanza al Paso 8 para completar el proceso.
                    </Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetPrev}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Conciliación Actual */}
        <div className="bg-white rounded-lg">
          <Accordion expanded={stepSeven}>
            <AccordionSummary aria-controls="panel3-content" id="panel3-header">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Circle
                    className={
                      stepEight && !errorConciliation
                        ? "text-green-500"
                        : errorConciliation
                        ? "text-red-500"
                        : "text-gray-400"
                    }
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
              {loadingConciliation && (
                <div className="relative min-h-32 w-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                {!stepEight && !errorConciliation && (
                  <Button
                    variant="contained"
                    disabled={loadingConciliation ? true : false}
                    className="flex gap-1 w-1/2 p-2 bg-blue-500 hover:bg-blue-700"
                    onClick={handleVerify}
                  >
                    <AutoAwesome />
                    Generar
                  </Button>
                )}
                {errorConciliation && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="relative">
                      <Circle className="text-red-500" fontSize="large" />
                      <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                        ✖
                      </Typography>
                    </div>
                    <Typography>Error al realizar extracción</Typography>
                    <Typography variant="caption">Intenta de nuevo.</Typography>
                    <Button
                      variant="outlined"
                      className="flex gap-1"
                      onClick={handleResetConciliation}
                    >
                      <Refresh />
                      Reiniciar proceso
                    </Button>
                  </div>
                )}
                {stepEight && !errorConciliation && (
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                      <div className="relative">
                        <Circle className="text-green-500" fontSize="large" />
                        <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                          ✔
                        </Typography>
                      </div>
                      <Typography>Conciliación realizada con éxito.</Typography>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant="outlined"
                        className="flex gap-1"
                        onClick={handleReset}
                      >
                        <Refresh />
                        Reiniciar proceso
                      </Button>
                      <Button
                        variant="contained"
                        className="flex gap-1"
                        onClick={handleDownload}
                      >
                        <Download />
                        Descargar
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
