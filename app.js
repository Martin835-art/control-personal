const URL_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbwiz9TU_P5lkyG4wdOWhVdehg_rh7i14ajazz8BtVVqSTraOP1t_rw1E-g5bFL_hHWo7Q/exec";

// Personas que actualmente están dentro
let personasDentro = [];

// ==========================================
// REGISTRAR INGRESO O SALIDA
// ==========================================
function registrarMovimiento(movimiento) {
    const persona = document.getElementById("persona").value;

    if (persona === "") {
        alert("Primero seleccione una persona.");
        return;
    }

    // Evitar doble ingreso
    if (movimiento === "INGRESO" && personasDentro.includes(persona)) {
        alert(persona + " ya está registrada como DENTRO.");
        return;
    }

    // Evitar salida si no está dentro
    if (movimiento === "SALIDA" && !personasDentro.includes(persona)) {
        alert(persona + " no está registrada como DENTRO.");
        return;
    }

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-CO");
    const hora = ahora.toLocaleTimeString("es-CO");

    const datos = {
        persona: persona,
        movimiento: movimiento,
        fecha: fecha,
        hora: hora
    };

    // Enviar a Google Sheets (Mantiene el modo no-cors para celular)
    fetch(URL_GOOGLE_SHEETS, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(datos)
    });

    // Actualizar estado visual inmediato
    if (movimiento === "INGRESO") {
        personasDentro.push(persona);
        document.getElementById("estado").innerText = persona + " está dentro. Ingreso: " + hora;
    }

    if (movimiento === "SALIDA") {
        personasDentro = personasDentro.filter(p => p !== persona);
        document.getElementById("estado").innerText = persona + " salió. Salida: " + hora;
    }

    actualizarPersonalDentro();

    // Agregar al historial visual
    const icono = movimiento === "INGRESO" ? "🟢" : "🔴";
    document.getElementById("historial").innerHTML +=
        '<div class="registro">' + persona + " — " + icono + " " + movimiento + " — " + fecha + " — " + hora + "</div>";
}

// ==========================================
// MOSTRAR PERSONAL DENTRO
// ==========================================
function actualizarPersonalDentro() {
    const contenedor = document.getElementById("personalDentro");

    if (personasDentro.length === 0) {
        contenedor.innerHTML = "<p>No hay personas dentro.</p>";
        return;
    }

    contenedor.innerHTML = "";
    personasDentro.forEach(function(persona) {
        contenedor.innerHTML += '<div class="persona-dentro">' + "🟢 " + persona + " — DENTRO" + "</div>";
    });
}

// ==========================================
// LEER GOOGLE SHEETS
// ==========================================
async function cargarEstadoActual() {
    try {
        const respuesta = await fetch(URL_GOOGLE_SHEETS);
        const registros = await respuesta.json();

        personasDentro = [];

        // Revisar todos los registros
        registros.forEach(function(registro) {
            const persona = registro.persona;
            const movimiento = registro.movimiento;

            if (movimiento === "INGRESO") {
                if (!personasDentro.includes(persona)) {
                    personasDentro.push(persona);
                }
            }

            if (movimiento === "SALIDA") {
                personasDentro = personasDentro.filter(p => p !== persona);
            }
        });

        actualizarPersonalDentro();
    } catch (error) {
        console.error("Error leyendo Google Sheets:", error);
    }
}

// ==========================================
// BOTONES
// ==========================================
function registrarIngreso() {
    registrarMovimiento("INGRESO");
}

function registrarSalida() {
    registrarMovimiento("SALIDA");
}

// ==========================================
// CARGAR ESTADO AL ABRIR LA APP
// ==========================================
window.addEventListener("load", cargarEstadoActual);
