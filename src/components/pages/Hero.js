import React, { useEffect } from 'react';
import Backgroung from '../imgs/background.webp'

function Hero({ title }) { 

  const heroStyle = {
    backgroundImage: `url(${Backgroung})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    color: '#fff',
    height: '200px',  
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

    useEffect(() => {
        document.title = title; // atualiza o título da página
      }, [title]); // a dependência assegura que o efeito seja executado toda vez que `title` mudar

      return (
        <div>
            <div className="Hero" style={heroStyle}> 
              <h1>{title}</h1>
            </div>
      </div>
      )
    }
    
    export default Hero;