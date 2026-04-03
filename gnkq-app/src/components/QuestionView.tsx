import React, { useState, useEffect } from 'react';
import type { QuestionType } from '../data/questions';

interface QuestionViewProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, timeSpent: number) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Timer logic
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [question.id]); // Reset timer when question changes

  // Reset selected option when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTimeSpent(0);
  }, [question.id]);

  const handleNext = () => {
    if (selectedOption) {
      onAnswer(selectedOption, timeSpent);
    }
  };

  // Format time display as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="content-area">
      <div className="top-bar">
        <span>Pregunta {questionNumber} de {totalQuestions}</span>
        <span className="timer">Tiempo: {formatTime(timeSpent)}</span>
      </div>

      <div className="categories-header">
        <div className="question-category margin-0">
          {question.section}
        </div>
        {question.category && (
          <div className="specific-category">
            {question.category}
          </div>
        )}
      </div>

      <h2 className="question-title">{question.text}</h2>

      {question.image && (
        <div className="question-image-container">
          <img src={question.image} alt="Imagen de referencia para la pregunta" className="question-image" />
        </div>
      )}

      <div className="options-grid">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          className="btn"
          onClick={handleNext}
          disabled={!selectedOption}
        >
          {questionNumber === totalQuestions ? 'Finalizar Cuestionario' : 'Siguiente Pregunta'}
        </button>
      </div>
    </div>
  );
};

export default QuestionView;
