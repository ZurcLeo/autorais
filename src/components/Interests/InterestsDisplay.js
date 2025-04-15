// src/components/InterestsDisplay.js
import React from 'react';
import { useInterests } from '../../providers/InterestsProvider';

const InterestsDisplay = () => {
  const { interests } = useInterests();

  return (
    <div>
      {Object.keys(interests).map(category => (
        <div key={category}>
          <h2>{category}</h2>
          <ul>
            {interests[category].map(interest => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default InterestsDisplay;