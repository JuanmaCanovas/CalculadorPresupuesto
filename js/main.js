
apiUrl='https://6729702f6d5fa4901b6d2615.mockapi.io/producto';

let productos = [];
let productoEditandoId = null;

async function obtenerProductos() {
    return fetch(apiUrl)
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al obtener los productos');
      }
      return respuesta.json();
    })
    .then(data => {
      productos = data;
    })
    
    .catch(error => {
      console.error('Hubo un problema al obtener los productos:', error);
    });
    
}


async function checkAuthentication() {
  const isLoggedIn = await isAuthenticated(); 
  if (!isLoggedIn) {
      alert("Debes iniciar sesión para realizar esta acción");
      return false;
  }
  return true;
}


async function agregarProducto() {
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) return; // Si no está autenticado, no permite agregar producto

  const nombre = document.getElementById('nombre').value;
  const precio = parseFloat(document.getElementById('precio').value);
  let imgUrl = document.getElementById('imgUrl').value;
  const type = document.querySelector('.selectedType').value;

    
  if (!nombre) {
    alert('Por favor, ingresa un nombre para el producto');
    return;
  }

  
  if (isNaN(precio) || precio <= 0) {
    alert('Por favor, ingresa un precio válido para el producto');
    return;
  }

  
  if (!type) {
    alert('Por favor, selecciona un tipo para el producto');
    return;
  }

  if (imgUrl == '') {
      imgUrl = 'Images/imagen_articulo_por_defecto.jpg';
  }
  const nuevoProducto = {
      name: nombre,
      precio: precio,
      img: imgUrl,
      tipo: type
  };

  try {
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(nuevoProducto)
      });

      if (!response.ok) {
          throw new Error('Error al agregar el producto');
      }

      const productoAgregado = await response.json();
      productos.push(productoAgregado); 
      mostrar(); 
      document.getElementById('nombre').value = '';
      document.getElementById('precio').value = '';
      document.getElementById('imgUrl').value = '';
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
      modal.hide();
  } catch (error) {
      console.error('Hubo un problema al agregar el producto:', error);
  }
}

async function eliminarProducto(id) {
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) return; 

  try {
      const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar el producto');

      
      await obtenerProductos();
     
      mostrar();
  } catch (error) {
      console.error('Hubo un problema al eliminar el producto:', error);
  }
}


  
  async function mostrar() {
    const contenedor = document.getElementById('productos-container');
    contenedor.innerHTML = ''; 

    
    const isLoggedIn = await isAuthenticated();

    if (productos.length > 0) {
        let cardsHtml = '';

        for (const producto of productos) {
            cardsHtml += `
                <div class="card" style="width: 15rem;">
                    <img src="${producto.img}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${producto.name}</h5>
                        <p class="card-text">$${producto.precio}</p>
                        <p class="card-text">Categoria: ${producto.tipo}</p>
                        ${isLoggedIn ? `
                            <button class="btn btn-warning" onclick="cargarProductoEnFormulario('${producto.id}', '${producto.name}', '${producto.precio}', '${producto.img}', '${producto.tipo}')">Editar</button>
                            <button class="btn btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                        ` : ''}
                    </div>
                </div>`;
        }

        contenedor.innerHTML = cardsHtml; 
    } else {
        contenedor.innerHTML = '<p>No se encontraron productos.</p>'; 
    }
}

function cargarProductoEnFormulario(id, nombre, precio, img, tipo) {
    
    document.getElementById('nombre').value = nombre;
    document.getElementById('precio').value = precio;
    document.getElementById('imgUrl').value = img;
    document.querySelector('.selectedType').value = tipo;

    productoEditandoId = id;
    
    const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();
}

async function actualizarProducto() {
    

    if (!productoEditandoId) {
        console.error('No hay un producto para editar');
        return;
    }

    const botonConfirmar = document.getElementById('agregarArticulo'); 
    botonConfirmar.disabled = true; // Deshabilitar el botón para evitar múltiples clics

    const nombre = document.getElementById('nombre').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const imgUrl = document.getElementById('imgUrl').value;
    const tipo = document.querySelector('.selectedType').value;

    const productoActualizado = {
        name: nombre,
        precio: precio,
        img: imgUrl,
        tipo: tipo
    };

    try {
        const response = await fetch(`${apiUrl}/${productoEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoActualizado)
        });

        if (!response.ok) throw new Error('Error al actualizar el producto');
        const data = await response.json();

        // Actualizar el producto en la lista local
        productos = productos.map(prod => prod.id === productoEditandoId ? data : prod);

        
        productoEditandoId = null;  // Limpiar el ID después de la actualización

        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
        await obtenerProductos();
        mostrar();
    } catch (error) {
        console.error('Hubo un problema al actualizar el producto:', error);
    }
    botonConfirmar.disabled = false;
}


async function main() {
  await obtenerProductos();
  mostrar();
}

  
  
  

  document.getElementById('agregarArticulo').addEventListener('click', () => {
    if (productoEditandoId) {
        actualizarProducto(); 
        productoEditandoId = null; 
    } else {
        agregarProducto(); 
    }
});


document.getElementById('addItem').addEventListener('click', () => {
    let contenedor = document.getElementById('budgetItems');

    const nuevaFila = document.createElement('div');
    nuevaFila.classList.add('itemContainer');

    nuevaFila.innerHTML = `
        <div class="inputContainer">
            <label for="itemSelector">Seleccionar Articulo</label>
            <select class="form-select itemSelector" aria-label="Default select example">
                <option selected value="0">Selecciona un articulo</option>
            </select>
        </div>
        <div class="inputContainer">
            <label for="cantItem">Cantidad de articulos</label>
            <input type="number" class="form-control cantItem" required>
        </div>
        <div class="inputContainer">
            <label for="priceContainer" class="priceLabel">Precio del articulo</label>
            <div class="priceContainer">
                <p class="priceItem">$0</p>
            </div>
        </div>
        <button type="button" class="btn btn-danger deltbn eliminarBtn">X</button>
    `;

    contenedor.appendChild(nuevaFila);

    nuevaFila.querySelector('.eliminarBtn').addEventListener('click', () => {
        contenedor.removeChild(nuevaFila);
    });

    // Cargar artículos solo para el nuevo selector
    const nuevoSelector = nuevaFila.querySelector('.itemSelector');
    loadSelectorItems(nuevoSelector);
});

document.getElementById('addOpcional').addEventListener('click', ()=>{

    let contenedor = document.getElementById('opcionalesContainer');

    const nuevaFila = document.createElement('div');
    nuevaFila.classList.add('itemContainerOptional');

    nuevaFila.innerHTML = `

        <div class="inputContainer">
            <label for="nombreArticulo">Nombre del Articulo</label>
            <input type="text" class="form-control nombreArticulo" required>
        </div>

        <div class="inputContainer">
            <label for="cantItemOpcional">Cantidad de articulos</label>
            <input type="number" class="form-control cantItemOpcional" required>
        </div>
        <div class="inputContainer">
            <label for="priceItemOpcional">Precio</label>
            <input type="number" class="form-control priceItemOpcional" required>
        </div>

        <button type="button" class="btn mt-4 btn-danger deltbn eliminarBtn">X</button>
    `;

    contenedor.appendChild(nuevaFila);

    nuevaFila.querySelector('.eliminarBtn').addEventListener('click', () => {
        contenedor.removeChild(nuevaFila);
    });

});

function loadSelectorItems(selector) {
    const selectedType = document.getElementById('tipoSeleccionado').value;

    // Verificar si ya se cargaron las opciones para evitar duplicados
    const opcionesExistentes = Array.from(selector.options).map(option => option.value);
    if (opcionesExistentes.length > 1) return;

    // Filtrar productos por tipo seleccionado
    const itemsFiltrados = productos.filter(producto => producto.tipo === selectedType);

    // Agregar las opciones al selector
    itemsFiltrados.forEach(producto => {
        if (!opcionesExistentes.includes(producto.id)) {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = producto.name;
            selector.appendChild(option);
        }
    });
}

// Escuchar cambios en el selector de tipo
document.addEventListener('change', (event) => {
    if (event.target.id === 'tipoSeleccionado') {
        const selectedType = event.target.value;
        const itemSelectors = document.querySelectorAll('.itemSelector');

        itemSelectors.forEach(selector => {
            const selectedValue = selector.value;

            // Actualizar solo si el producto seleccionado no coincide con el tipo actual
            const selectedProduct = productos.find(prod => prod.id === selectedValue);
            if (selectedProduct && selectedProduct.tipo === selectedType) return;

            // Resetear el selector
            selector.innerHTML = '<option selected value="0">Selecciona un articulo</option>';
            loadSelectorItems(selector);
        });

        // Resetear precios
        const precios = document.querySelectorAll('.priceItem');
        precios.forEach(precio => precio.textContent = '$0');
    }
});

// Actualizar precio al seleccionar un artículo
document.addEventListener('change', (event) => {
    if (event.target.classList.contains('itemSelector')) {
        const selectedId = event.target.value;
        const selectedProduct = productos.find(prod => prod.id === selectedId);
        const priceContainer = event.target.closest('.itemContainer').querySelector('.priceItem');
        priceContainer.textContent = selectedProduct ? `$${selectedProduct.precio}` : '$0';
    }
});

function getDate(diasSumar = 0) {
    const fechaHoy = new Date();
    
    // Sumar los días si se pasa el parámetro
    fechaHoy.setDate(fechaHoy.getDate() + diasSumar);

    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio", 
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const dia = fechaHoy.getDate();
    const mes = meses[fechaHoy.getMonth()]; 
    const anio = fechaHoy.getFullYear();

    const fechaFormateada = `${dia} de ${mes} de ${anio}`;

    return fechaFormateada;
}


document.getElementById('generarPdf').addEventListener('click',()=>{

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const fechaHoy = getDate();

    let tipoPresupuesto = document.getElementById('tipoSeleccionado').value;
    let nombreCliente = document.getElementById('nombreCliente').value;
    let direccionCliente = document.getElementById('direccionCliente').value;
    let items = document.querySelectorAll('.itemContainer');
    let itemsOpcionales = document.querySelectorAll('.opcionales');
    let precioBocas = document.getElementById('priceBocas').value;
    let cantBocas = document.getElementById('cantBocas').value;

    let total = 0;
    let yPosition = 20;
    doc.setFont("times", "normal");

    // 1. Agregar logo
    doc.addImage('Images/DigisegLogo.png', 'PNG', 25, yPosition, 25, 25); // Tamaño del logo
    yPosition += 7;


    // 2. Agregar texto "Seguridad Digital"
    doc.setFontSize(11);
    doc.text('Seguridad Digital.', 50, yPosition); // 45 es la posición X después del logo
    yPosition += 0;

    // 3. Agregar imagen "DigisegText.png"
    doc.addImage('Images/DigisegText.png', 'PNG', 45, yPosition, 40, 15); // Tamaño de la imagen
    yPosition += 15;

    // 4. Agregar texto "Tel: 154346527"
    doc.setFontSize(8);
    doc.text('Tel: 154346527', 55, yPosition); // Posición bajo la imagen
    yPosition += 10;


    doc.setFontSize(12);
    doc.text(fechaHoy,140,yPosition)
    yPosition+=12;
    doc.setFontSize(14);
    doc.text('PRESUPUESTO', 90, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Estimado Sr/Sra',20,yPosition);
    yPosition+=5;
    doc.text(nombreCliente,20,yPosition);
    yPosition+=5;
    doc.text(direccionCliente,20,yPosition);
    yPosition+=10;
    doc.text('Instalacion de sistema de '+tipoPresupuesto+ ' compuesto por:',20,yPosition);
    yPosition+=10;

    if (isNaN(precioBocas) || isNaN(cantBocas) || precioBocas <= 0 || cantBocas <= 0 || nombreCliente=='' || direccionCliente == '') {
        alert('Por favor, ingrese valores válidos para el precio y cantidad de bocas.');
        return; 
    }

    for (const item of items){

        let articuloId = parseInt(item.querySelector('.itemSelector').value, 10);
        const producto = productos.find(p => p.id == articuloId);
        const articuloNombre = producto ? producto.name : "Producto desconocido";
        let cantidad = item.querySelector('.cantItem').value;
        let precio = parseInt(item.querySelector('.priceItem').textContent.replace('$', '')) || 0;

        if (isNaN(articuloId) || articuloId <= 0 || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
            alert('Por favor, complete todos los campos de los productos correctamente.');
            return;
        }

        doc.setFontSize(12);
        doc.text(`${articuloNombre} x ${cantidad}`, 20, yPosition);
        yPosition += 4;

        total += precio * cantidad;

        console.log ('El total es de '+ precio + ' Compraste: '+cantidad+' '+articuloNombre);
    }

    


    let totalFinal=(total+(precioBocas*cantBocas));

    if (isNaN(totalFinal) || totalFinal <= 0) {
        alert('Error al calcular el total. Por favor, revise los valores ingresados.');
        return;
    }

    let adelanto = Math.floor(totalFinal * 0.6);
let totalRedondeado = Math.floor(totalFinal);

// Aplica `toLocaleString()` solo a los números redondeados
let totalFormateado = totalRedondeado.toLocaleString('es-ES');
let adelantoFormateado = adelanto.toLocaleString('es-ES');

    yPosition += 10;
    doc.text(`Total, materiales mas mano de obra $${totalFormateado} ARS, se debe abonar un adelanto de $${adelantoFormateado} ARS.`, 20, yPosition);
    yPosition +=20;

    if (itemsOpcionales[0].children.length > 0){
        doc.text('Opcional que se agrega al presupuesto', 20, yPosition);
        let totalOpcional=0;
        for (const itemOpcional of itemsOpcionales){
            const producto = itemOpcional.querySelector('.nombreArticulo').value;
            const cantProducto = itemOpcional.querySelector('.cantItemOpcional').value;
            const precio = itemOpcional.querySelector('.priceItemOpcional').value;

            if ((producto == '')|| isNaN(cantProducto) || cantProducto <= 0 || isNaN(precio) || precio <= 0) {
                alert('Por favor, complete todos los campos de los productos correctamente.');
                return;
            }
            let precioRedondeado = Math.floor(precio);
            let precioFormateado = precioRedondeado.toLocaleString('es-ES');
            doc.setFontSize(12);
            yPosition+=5;
            doc.text(`${producto} x ${cantProducto} $${precioFormateado}`, 20, yPosition);
            yPosition += 5;

            totalOpcional += precio * cantProducto;
        }

        

        
        yPosition+=20;
        doc.text(`Plazo mantenimiento de oferta 10 dias corridos. esta oferta vence el dia `+ getDate(10),20,yPosition);
    }

    
    doc.save('Presupuesto '+nombreCliente);
});

