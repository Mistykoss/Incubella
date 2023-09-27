  //esta es la info de cada elemento dot
  import TWEEN from "@tweenjs/tween.js";

  export let goToSecond = false;
  const DOTS = {
    "on-chain": {
      id: 3,
      title: "On-chain Memberships",
      // Otros datos relacionados con "On-chain Memberships"
    },
      "access": {
        id: 1,
        title: "Access cards",
        // Otros datos relacionados con "Access cards"
      },
      "token-gated": {
        id: 2,
        title: "Token-gated chat",
        // Otros datos relacionados con "Token-gated chat"
      },
      "nft": {
        id: 4,
        title: "NFT ticketing",
        // Otros datos relacionados con "NFT ticketing"
      },
      "ttf": {
        id: 4,
        title: "Tocken Chat",
        // Otros datos relacionados con "NFT ticketing"
      },
      // Agregar aquí más elementos si es necesario
    };

    export let lastChild;
  //Crea elementos h2 a partir de un objeto 'dots' y los almacena en un arreglo.

  function createH2SubHeaders(dots) {
    const subHeaderArray = []; // Arreglo para almacenar los elementos h2 creados.

    for (const key in dots) {
      if (dots.hasOwnProperty(key)) {
        const dot = dots[key];
        const container = document.createElement('div');
        lastChild = container;
        container.classList.add("dot");
        const subHeader = document.createElement('h2'); // Crear un elemento h2 para cada 'dot'.
        subHeader.classList.add("dot__sub-header")
        subHeader.textContent = dot.title; // Establecer el contenido del h2 como el título del 'dot'.
        subHeader.id = dot.key; // Establecer el atributo 'id' del h2 como el identificador del 'dot' (cumpliendo con el SEO).
        container.appendChild(subHeader);
        //container.addEventListener('click', handleClick);


        subHeaderArray.push(container); // Agregar el h2 al arreglo.

        
        subHeader.addEventListener('click', (event)=>{
          goToSecond = !goToSecond;
          console.log(goToSecond);
          subHeaderArray.forEach(element => {
            console.log(element)
            element.classList.add("deactive");
          });
          
        })
        subHeader.addEventListener('mouseover', (event)=>{
          const background = document.getElementById("renderer");
          console.log(background);
          background.classList.remove("item-no-active");
          background.classList.add("item-active");

        })
        subHeader.addEventListener('mouseout', (event)=>{
          const background = document.getElementById("renderer");
          background.classList.remove("item-active");
          background.classList.add("item-no-active");

        })
      }
    }

    return subHeaderArray; // Devolver el arreglo de elementos h2.
  }

  


  //exportar los elementos creados

  export const DotItems = createH2SubHeaders(DOTS);
