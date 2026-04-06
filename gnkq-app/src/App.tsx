import React, { useState, useEffect } from 'react';
import ConsentForm from './components/ConsentForm';
import type { UserData } from './components/ConsentForm';
import QuestionView from './components/QuestionView';
import FinishScreen from './components/FinishScreen';
import type { AnswerData } from './components/FinishScreen';
import { questions } from './data/questions';

type AppStep = 'checking' | 'blocked' | 'consent' | 'question' | 'finish';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('checking');
  
  // State for Consent Step
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('gnkq_userData');
    return saved ? JSON.parse(saved) : null;
  });
  
  // State for Question Step
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem('gnkq_currentQuestion');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [answers, setAnswers] = useState<AnswerData[]>(() => {
    const saved = localStorage.getItem('gnkq_answers');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Session tracking
  const [tabSwitches, setTabSwitches] = useState(() => {
    const saved = localStorage.getItem('gnkq_tabSwitches');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Initialize and check localStorage to prevent multiple retakes
  useEffect(() => {
    const hasCompleted = localStorage.getItem('gnkq_completed');
    if (hasCompleted === 'true') {
      setStep('blocked');
    } else {
      const savedUserData = localStorage.getItem('gnkq_userData');
      if (savedUserData) {
        setStep('question');
      } else {
        setStep('consent');
      }
    }
  }, []);

  // Track state changes to localStorage
  useEffect(() => {
    if (userData) {
      localStorage.setItem('gnkq_userData', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('gnkq_currentQuestion', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  useEffect(() => {
    localStorage.setItem('gnkq_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('gnkq_tabSwitches', tabSwitches.toString());
  }, [tabSwitches]);

  // Track tab switches during the questionnaire
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && step === 'question') {
        setTabSwitches(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [step]);

  const handleConsentComplete = (data: UserData) => {
    setUserData(data);
    setStep('question');
  };

  const handleAnswer = (answer: string, timeSpentSeconds: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer,
        timeSpentSeconds
      }
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Completed all questions
      localStorage.setItem('gnkq_completed', 'true');
      setStep('finish');
    }
  };

  if (step === 'checking') {
    return <div className="app-container"><div className="content-area">Cargando...</div></div>;
  }

  if (step === 'blocked') {
    return (
      <div className="app-container">
        <div className="blocked-screen">
          <h2>Acceso Denegado</h2>
          <p>
            Ya has completado este cuestionario anteriormente. 
            El acceso está restringido a una única participación por usuario.
          </p>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Gracias por tu interés en nuestro estudio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {step === 'consent' && (
        <ConsentForm onComplete={handleConsentComplete} />
      )}
      
      {step === 'question' && (
        <QuestionView
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
        />
      )}

      {step === 'finish' && userData && (
        <FinishScreen
          userData={userData}
          answers={answers}
          tabSwitches={tabSwitches}
        />
      )}
    </div>
  );
};

export default App;
