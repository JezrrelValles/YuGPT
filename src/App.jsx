import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircleIcon from "@mui/icons-material/Circle";
import DragDropComponent from "./components/DragDropComponent";
import Navbar from "./components/Navbar";
import { ContentPaste, CleaningServices } from "@mui/icons-material";

function App() {
  const [selectedBank, setSelectedBank] = useState("BANAMEX");
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedExcel, setSelectedExcel] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [resultText, setResultText] = useState("");
  const [excelText, setExcelText] = useState("");
  const [comparisonResult, setComparisonResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAux, setLoadingAux] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [differences, setDifferences] = useState("");

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handlePDFChange = (file) => {
    setSelectedPDF(file);
  };

  const handleExcelChange = (file) => {
    setSelectedExcel(file);
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
      const response = await fetch("http://localhost:8000/convert_csv/", {
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
    }
  };

  const handleComparison = async () => {
    setLoadingComparison(true);
    setError(null);
    setComparisonResult("");

    try {
      const pdfTransactions = JSON.parse(resultText);
      const csvTransactions = JSON.parse(excelText);

      const normalizedCsvTransactions =
        normalizeCsvTransactions(csvTransactions);

      if (!pdfTransactions || !normalizedCsvTransactions) {
        throw new Error("Los datos de transacciones no están definidos.");
      }

      const response = await fetch(
        "http://localhost:8000/compare_transactions/",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assistant_transactions: pdfTransactions,
            aux_transactions: normalizedCsvTransactions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al comparar las transacciones.");
      }

      const data = await response.json();
      setComparisonResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error: ", error);
      setError("Error");
    } finally {
      setLoadingComparison(false);
    }
  };

  const jsonPDF = {
    assistant_transactions: [
      {
        fecha: "31-MAR-24",
        tipo: "saldo inicial",
        monto: 5513.93,
        saldo: 5513.93,
      },
      {
        fecha: "02-ABR-24",
        tipo: "deposito",
        monto: 35000,
        saldo: 40513.93,
      },
      {
        fecha: "04-ABR-24",
        tipo: "retiro",
        monto: 22443.85,
        saldo: 18070.08,
      },
      {
        fecha: "04-ABR-24",
        tipo: "retiro",
        monto: 104,
        saldo: 17966.08,
      },
      {
        fecha: "10-ABR-24",
        tipo: "retiro",
        monto: 530,
        saldo: 17436.08,
      },
      {
        fecha: "15-ABR-24",
        tipo: "retiro",
        monto: 13021,
        saldo: 14415.08,
      },
      {
        fecha: "15-ABR-24",
        tipo: "retiro",
        monto: 9180,
        saldo: 5235.08,
      },
      {
        fecha: "15-ABR-24",
        tipo: "retiro",
        monto: 139,
        saldo: 5096.08,
      },
      {
        fecha: "16-ABR-24",
        tipo: "retiro",
        monto: 119,
        saldo: 4977.08,
      },
      {
        fecha: "17-ABR-24",
        tipo: "retiro",
        monto: 140,
        saldo: 4837.08,
      },
      {
        fecha: "17-ABR-24",
        tipo: "retiro",
        monto: 770,
        saldo: 4067.08,
      },
      {
        fecha: "18-ABR-24",
        tipo: "retiro",
        monto: 1751.54,
        saldo: 2315.54,
      },
      {
        fecha: "22-ABR-24",
        tipo: "retiro",
        monto: 1296,
        saldo: 1019.54,
      },
      {
        fecha: "22-ABR-24",
        tipo: "retiro",
        monto: 299.94,
        saldo: 719.6,
      },
      {
        fecha: "23-ABR-24",
        tipo: "deposito",
        monto: 10000,
        saldo: 10719.6,
      },
      {
        fecha: "25-ABR-24",
        tipo: "retiro",
        monto: 597.78,
        saldo: 10121.82,
      },
      {
        fecha: "30-ABR-24",
        tipo: "saldo final",
        monto: 69,
        saldo: 10052.82,
      },
    ],
  };

  const jsonExcel = {
    aux_transactions: [
      {
        fecha: "31-MAR-24",
        tipo: "retiro",
        monto: 0,
        saldo: 5513.93,
      },
      {
        fecha: "02-ABR-24",
        tipo: "deposito",
        monto: 35000,
        saldo: 40513.93,
      },
      {
        fecha: "04-ABR-24",
        tipo: "retiro",
        monto: 22443.85,
        saldo: 18070.08,
      },
      {
        fecha: "04-ABR-24",
        tipo: "retiro",
        monto: 104,
        saldo: 17966.08,
      },
      {
        fecha: "10-ABR-24",
        tipo: "retiro",
        monto: 530,
        saldo: 17436.08,
      },
      {
        fecha: "15-ABR-24",
        tipo: "retiro",
        monto: 3021,
        saldo: 14415.08,
      },
      {
        fecha: "15-ABR-24",
        tipo: "retiro",
        monto: 9180,
        saldo: 5235.08,
      },
      {
        fecha: "15-ABR-24",
        tipo: "retiro",
        monto: 139,
        saldo: 5096.08,
      },
      {
        fecha: "16-ABR-24",
        tipo: "retiro",
        monto: 119,
        saldo: 4977.08,
      },
      {
        fecha: "17-ABR-24",
        tipo: "retiro",
        monto: 140,
        saldo: 4837.08,
      },
      {
        fecha: "17-ABR-24",
        tipo: "retiro",
        monto: 770,
        saldo: 4067.08,
      },
      {
        fecha: "18-ABR-24",
        tipo: "retiro",
        monto: 1751.54,
        saldo: 2315.54,
      },
      {
        fecha: "22-ABR-24",
        tipo: "retiro",
        monto: 1296,
        saldo: 1019.54,
      },
      {
        fecha: "22-ABR-24",
        tipo: "retiro",
        monto: 299.94,
        saldo: 719.6,
      },
      {
        fecha: "23-ABR-24",
        tipo: "deposito",
        monto: 10000,
        saldo: 10719.6,
      },
      {
        fecha: "25-ABR-24",
        tipo: "retiro",
        monto: 597.78,
        saldo: 10121.82,
      },
      {
        fecha: "30-ABR-24",
        tipo: "retiro",
        monto: 69,
        saldo: 10052.82,
      },
      {
        fecha: "FECHA_DESCONOCIDA",
        tipo: "deposito",
        monto: 45000,
        saldo: 10052.82,
      },
    ],
  };

  const compareTransactions = (jsonPDF, jsonExcel) => {
    const pdfTransactions = jsonPDF.assistant_transactions;
    const excelTransactions = jsonExcel.aux_transactions;

    let differences = [];

    pdfTransactions.forEach((pdfTx, index) => {
      const excelTx = excelTransactions[index];

      if (!excelTx) {
        differences.push({
          index,
          message: "Transaccion en PDF no tiene correspondencia en Excel",
          pdfTx,
          excelTx: null,
        });
        return;
      }
      let diff = {};

      Object.keys(pdfTx).forEach((key) => {
        if (pdfTx[key] !== excelTx[key]) {
          diff[key] = { pdf: pdfTx[key], excel: excelTx[key] };
        }
      });

      if (Object.keys(diff).length > 0) {
        differences.push({ index, differences: diff });
      }
    });

    if (excelTransactions.length > pdfTransactions.length) {
      for (let i = pdfTransactions.length; i < excelTransactions.length; i++) {
        differences.push({
          index: i,
          message: "Transaccion en Excel no correspondiente en PDF",
          pdfTx: null,
          excelTx: excelTransactions[i],
        });
      }
    }
    return differences;
  };

  const handleVerify = async () => {
    setLoadingComparison(true);

    const result = compareTransactions(jsonPDF, jsonExcel);

    const resultText =
      result.length > 0
        ? result
            .map(
              (diff, index) => `#${index + 1}: ${JSON.stringify(diff, null, 2)}`
            )
            .join("\n\n")
        : "No hay diferencias.";

    setDifferences(resultText);
    setLoadingComparison(false);
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
      differences,
    });
  }, [
    selectedPDF,
    selectedBank,
    resultText,
    selectedExcel,
    excelText,
    differences,
  ]);

  return (
    <div className="h-full w-full bg-[#EEEEEE]">
      <Navbar />
      <div className="grid grid-cols-3 gap-4 p-4 h-full rounded-lg">
        <div className="bg-white">
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon className="text-blue-500" fontSize="large" />
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

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon className="text-blue-500" fontSize="large" />
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

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon className="text-blue-500" fontSize="large" />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    3
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Resultado
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="relative h-full w-full">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                )}
                <textarea
                  readOnly
                  value={resultText}
                  disabled
                  className="w-full min-h-64 rounded-lg border-4 border-blue-500 p-4"
                ></textarea>
              </div>
            </AccordionDetails>
            <AccordionActions>
              <Button variant="outlined" onClick={handleCleanPDF}>
                <CleaningServices />
              </Button>
              <Button variant="outlined" onClick={handleCopyPDF}>
                <ContentPaste />
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                className="w-1/2 bg-blue-500 text-center hover:bg-blue-500"
              >
                Extraer
              </Button>
            </AccordionActions>
          </Accordion>
        </div>

        <div className="bg-white">
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon className="text-red-500" fontSize="large" />
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
                  * El formato permitido es .XSLX o .CSV
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

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon className="text-red-500" fontSize="large" />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    5
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Resultado
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="relative h-full w-full">
                {loadingAux && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-700"></div>
                  </div>
                )}
                <textarea
                  readOnly
                  value={excelText}
                  disabled
                  className="min-h-64 w-full rounded-lg border-4 border-red-500 p-4"
                ></textarea>
              </div>
            </AccordionDetails>
            <AccordionActions>
              <Button variant="outlined" onClick={handleCleanExcel}>
                <CleaningServices />
              </Button>
              <Button variant="outlined" onClick={handleCopyExcel}>
                <ContentPaste />
              </Button>
              <Button
                variant="contained"
                className="w-1/2 p-2 bg-blue-500 hover:bg-blue-700"
                onClick={handleSubmitAux}
              >
                Extraer
              </Button>
            </AccordionActions>
          </Accordion>
        </div>

        <div className="bg-white">
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <CircleIcon className="text-purple-500" fontSize="large" />
                  <Typography className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    6
                  </Typography>
                </div>
                <Typography variant="h6" component="span">
                  Verificar
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="text-center p-4">
                <Typography variant="body1" component="span">
                  Haz clic en el botón para comparar ambos archivos.
                </Typography>
              </div>
              <div className="relative h-full w-full">
                {loadingComparison && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-700"></div>
                  </div>
                )}
                <textarea
                  readOnly
                  value={differences}
                  disabled
                  className="w-full min-h-64 rounded-md border-4 border-purple-700 p-4"
                ></textarea>
              </div>
            </AccordionDetails>
            <AccordionActions>
              <Button variant="outlined" onClick={handleCleanDifferences}>
                <CleaningServices />
              </Button>
              <Button variant="outlined" onClick={handleCopyDifferences}>
                <ContentPaste />
              </Button>
              <Button
                variant="contained"
                className="w-1/2 p-2 bg-blue-500 hover:bg-blue-700"
                onClick={handleVerify}
              >
                Verificar
              </Button>
            </AccordionActions>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default App;
