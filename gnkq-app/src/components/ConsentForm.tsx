import React, { useState } from 'react';

export interface UserData {
  fullName: string;
  age: string;
  career: string;
  grade: string;
  occupation: string;
  phone: string;
}

interface ConsentFormProps {
  onComplete: (data: UserData) => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<UserData>({
    fullName: '',
    age: '',
    career: '',
    grade: '',
    occupation: '',
    phone: ''
  });
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = 
    formData.fullName.trim() !== '' &&
    formData.age.trim() !== '' &&
    formData.career.trim() !== '' &&
    formData.grade.trim() !== '' &&
    formData.occupation.trim() !== '' &&
    agreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete(formData);
    }
  };

  return (
    <div className="content-area">
      <div className="header consent-header">
        <h1>Estudio sobre Nutrición</h1>
        <p>Participación en investigación universitaria</p>
      </div>

      <form onSubmit={handleSubmit} className="consent-form">
        <p className="consent-subtitle">
          Antes de comenzar, por favor complete los siguientes datos para fines estadísticos de la investigación.
        </p>

        <div className="form-row">
          <div className="form-group flex-2">
            <label htmlFor="fullName">Nombre y Apellido</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Edad</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Ej. 22"
              min="16"
              max="99"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="career">Carrera</label>
            <input
              type="text"
              id="career"
              name="career"
              value={formData.career}
              onChange={handleChange}
              placeholder="Ej. Lic. en Nutrición"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grado o condición</label>
            <input
              type="text"
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Ej. 3er Año / Tesista"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="occupation">Cargo que ocupa (o estudiante)</label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            placeholder="Ej. Estudiante"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Número de Celular (Opcional)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ej. 381 1234567"
          />
          <small className="phone-hint">
            Únicamente para coordinar la segunda fase del estudio (valoración del estado nutricional).
          </small>
        </div>

        <div className="consent-box consent-intro">
          <h3>Consentimiento Informado</h3>
          <p className="consent-text-main">
            El presente estudio consta de dos fases: esta primera parte que consiste en un cuestionario para conocer su nivel de conocimiento nutricional (adaptación del General Nutrition Knowledge Questionnaire bajo lineamientos de las GAPA), y una eventual segunda fase presencial para la valoración de su estado nutricional.
          </p>
          <p>
            Por la presente, <strong>acepto participar voluntariamente</strong> en esta investigación sobre el nivel de conocimiento en nutrición y su relación con el estado nutricional en estudiantes universitarios.
          </p>
          <p>
            Comprendo que todos los datos proporcionados serán tratados de forma <strong>completamente anónima y confidencial</strong>, y se utilizarán exclusivamente con fines académicos y de investigación.
          </p>
          <p>
            Entiendo que la participación es voluntaria y que puedo abandonar el estudio en cualquier momento sin ninguna consecuencia. Al tildar la casilla de abajo, doy mi conformidad para el manejo anónimo de mis datos y para ser contactado/a en caso de continuar con la segunda fase del estudio.
          </p>
        </div>

        <label className="checkbox-wrap consent-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>He leído, comprendo y acepto los términos del consentimiento informado para participar de ambas fases de este estudio.</span>
        </label>

        <button type="submit" className="btn" disabled={!isFormValid}>
          Comenzar Cuestionario
        </button>
      </form>
    </div>
  );
};

export default ConsentForm;
