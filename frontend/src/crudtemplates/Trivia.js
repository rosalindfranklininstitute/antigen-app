import { useEffect, useRef } from 'react';

const Useful = () => {


  const indexRef = useRef(0);
useEffect(() => {
  const keyMap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b',
  };

  const sequence = [
    'up', 'up', 'down', 'down',
    'left', 'right', 'left', 'right',
    'b', 'a'
  ];

  const handler = (e) => {
    const key = keyMap[e.keyCode];
    const expected = sequence[indexRef.current];
    if (key === expected) {
      indexRef.current++;
      if (indexRef.current === sequence.length) {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        indexRef.current = 0;
      }
    } else {
      indexRef.current = 0;
    }
  };

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
  
}, []);
return <></>
};

export default Useful;
