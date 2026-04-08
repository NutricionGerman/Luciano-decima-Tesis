import React, { useEffect, useState } from 'react';
import type { UserData } from './ConsentForm';
import { questions } from '../data/questions';

export interface AnswerData {
  questionId: string;
  questionText: string;
  answer: string;
  timeSpentSeconds: number;
}

interface FinishScreenProps {
  userData: UserData;
  answers: AnswerData[];
  tabSwitches: number;
}

// Helper to escape CSV fields
const escapeCSV = (field: string) => `"${field.replace(/"/g, '""')}"`;

const generateCSV = (userData: UserData, answers: AnswerData[], tabSwitches: number, score: number, finalScore: number) => {
  const rows: string[][] = [];

  // Metadata
  const totalTime = answers.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
  
  rows.push(['=== DATOS DEL PARTICIPANTE ===', '', '', '']);
  rows.push(['Nombre Completo', 'Edad', 'Carrera', 'Grado o condición', 'Cargo que ocupa']);
  rows.push([
    escapeCSV(userData.fullName),
    escapeCSV(userData.age),
    escapeCSV(userData.career),
    escapeCSV(userData.grade),
    escapeCSV(userData.occupation)
  ]);
  
  rows.push(['', '', '', '']);
  rows.push(['=== ESTADISTICAS Y PUNTAJE ===', '', '', '']);
  rows.push(['Tiempo Total (segundos)', 'Puntaje Bruto', 'Penalizaciones (Salidas)', 'Puntaje Final']);
  rows.push([totalTime.toString(), score.toString(), tabSwitches.toString(), finalScore.toString()]);
  
  rows.push(['', '', '', '']);
  rows.push(['=== RESPUESTAS ===', '', '', '']);
  rows.push(['ID Pregunta', 'Pregunta', 'Respuesta Seleccionada', 'Correcta', 'Tiempo Empleado (segundos)']);
  
  answers.forEach((ans) => {
    const qObj = questions.find(q => q.id === ans.questionId);
    const isCorrect = qObj && qObj.correctAnswer === ans.answer ? "Sí" : "No";
    rows.push([
      ans.questionId,
      escapeCSV(ans.questionText),
      escapeCSV(ans.answer),
      isCorrect,
      ans.timeSpentSeconds.toString()
    ]);
  });

  return "\ufeff" + rows.map(e => e.join(",")).join("\n"); // Prepend BOM for Excel compatibility
};

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

const FinishScreen: React.FC<FinishScreenProps> = ({ userData, answers, tabSwitches }) => {
  const totalTimeSeconds = answers.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Calculate scores
  const score = answers.reduce((acc, ans) => {
    const currentQ = questions.find(q => q.id === ans.questionId);
    return (currentQ && currentQ.correctAnswer === ans.answer) ? acc + 1 : acc;
  }, 0);
  
  const finalScore = Math.max(0, score - tabSwitches);

  // Format time display as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const handleDownload = () => {
      const csvContent = generateCSV(userData, answers, tabSwitches, score, finalScore);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `GNKQ_Resultados_${userData.fullName.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const sendToSheets = async () => {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('TU_URL_AQUI')) return;
      setUploadStatus('sending');
      try {
        const payload = {
          fullName: userData.fullName,
          age: userData.age,
          career: userData.career,
          grade: userData.grade,
          occupation: userData.occupation,
          phone: userData.phone,
          score,
          tabSwitches,
          finalScore,
          totalTimeSeconds,
          answers: answers.map(ans => {
            const qObj = questions.find(q => q.id === ans.questionId);
            return {
              questionId: ans.questionId,
              answer: ans.answer,
              isCorrect: qObj ? qObj.correctAnswer === ans.answer : false,
            };
          }),
        };
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Apps Script no devuelve cabeceras CORS en modo producción
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        // Con no-cors no podemos leer la respuesta, pero si no lanza error es exitoso
        setUploadStatus('success');
      } catch {
        setUploadStatus('error');
      }
    };

    const timer = setTimeout(() => {
      handleDownload();
      sendToSheets();
    }, 1000);

    return () => clearTimeout(timer);
  }, [userData, answers, tabSwitches, score, finalScore]);

  const handleManualDownload = () => {
    const csvContent = generateCSV(userData, answers, tabSwitches, score, finalScore);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GNKQ_Resultados_${userData.fullName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-area">
      <div className="finish-icon">✅</div>
      
      <div className="finish-text">
        <h2>¡Cuestionario Completado!</h2>
        <p>
          Muchas gracias por tu participación. Tus respuestas han sido registradas.
        </p>
        {uploadStatus === 'sending' && (
          <p className="upload-status upload-sending">⏳ Enviando datos a la hoja de respuestas…</p>
        )}
        {uploadStatus === 'success' && (
          <p className="upload-status upload-success">☁️ Datos guardados correctamente en Google Sheets.</p>
        )}
        {uploadStatus === 'error' && (
          <p className="upload-status upload-error">⚠️ No se pudieron enviar los datos automáticamente. Enviá el CSV por correo.</p>
        )}
      </div>

      <div className="score-box">
        <h3>Tu Puntaje</h3>
        <div className="score-number">
          {finalScore} <span className="score-total">/ {questions.length}</span>
        </div>
        {tabSwitches > 0 && (
          <p className="score-penalty">
            Se descontaron {tabSwitches} punto{tabSwitches !== 1 ? 's' : ''} por salidas de la pestaña.
          </p>
        )}
      </div>

      <div className="stat-boxes-row">
        <div className="stat-box flex-1">
          <div className="label">Tiempo Total</div>
          <div className="value">{formatTime(totalTimeSeconds)}</div>
        </div>
        
        <div className="stat-box flex-1">
          <div className="label">Preguntas</div>
          <div className="value">{answers.length}</div>
        </div>
      </div>

      <button className="btn btn-outline" onClick={handleManualDownload}>
        Volver a descargar el informe (CSV)
      </button>
    </div>
  );
};

export default FinishScreen;
