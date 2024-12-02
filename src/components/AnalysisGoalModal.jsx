import React, { useState } from 'react';

const AnalysisGoalModal = ({ isOpen, onClose, onSubmit }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(goal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Sprecyzuj cel analizy</h3>
        <p className="text-gray-600 mb-4">
          Możesz pomóc mi w analizie określając dokładnie, co chcesz osiągnąć z tych danych, np.:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-600">
          <li>"Chcę znaleźć czynniki wpływające na konwersje"</li>
          <li>"Która kampania ma najwyższe ROI"</li>
          <li>"Jak zmienia się sprzedaż w czasie"</li>
        </ul>
        <form onSubmit={handleSubmit}>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md mb-4 h-32"
            placeholder="Wpisz cel swojej analizy..."
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Pomiń
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Analizuj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnalysisGoalModal;