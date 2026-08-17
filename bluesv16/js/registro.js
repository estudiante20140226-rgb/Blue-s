function mostrarMensaje(texto, tipo = 'info') {
    const mensajeEl = document.getElementById('message-box');
    if (!mensajeEl) {
        console.log(texto);
        return;
    }

    mensajeEl.textContent = texto;
    mensajeEl.style.color = tipo === 'error' ? '#ffb4b4' : '#f2d8c7';
}

function obtenerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem('usuarios')) || [];
    } catch {
        return [];
    }
}

function textoConfirmar() {
    const textoconf = document.getElementById('textoconf-exito');
    
    // Si por alguna razón no encuentra el textoconf en el HTML, avisa en consola
    if (!textoconf) {
        console.error("No se encontró el elemento con id 'textoconf-exito' en el HTML.");
        window.location.href = "iniciosesion.html"; // Redirección de emergencia
        return;
    }
    
    // Mostramos la pantalla temporal
    textoconf.classList.add('textoconf-visible');
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function obtenerDatosDelFormulario(form) {
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const confirmInput = form.querySelector('input[name="confirm"]');

    return {
        email: emailInput ? emailInput.value.trim() : '',
        password: passwordInput ? passwordInput.value : '',
        confirm: confirmInput ? confirmInput.value : ''
    };
}

// Nueva función para validar que tenga cara de correo electrónico
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function registrar(form, event) {
    event.preventDefault();

    const { email, password, confirm } = obtenerDatosDelFormulario(form);

    if (!email || !password || !confirm ) {
        mostrarMensaje('Completa todos los campos', 'error');
        return;
    }

    if (password !== confirm) {
        mostrarMensaje('Las contraseñas no coinciden.', 'error')
        return;

    }

    if (!validarEmail(email)) {
        mostrarMensaje('Por favor, ingresa un correo electrónico válido', 'error');
        return;
    }

    const usuarios = obtenerUsuarios();

    const usuarioExiste = usuarios.some(
        u => u.usuario.toLowerCase() === email.toLowerCase()
    );

    if (usuarioExiste) {
        mostrarMensaje('Ese correo ya está registrado', 'error');
        return;
    }

    usuarios.push({
        usuario: email,
        clave: password,
        confirmar: confirm
    });

    guardarUsuarios(usuarios);

    // 1. Limpiamos el formulario
    form.reset();

    // 2. Ejecutamos la pantalla temporal en lugar de redirigir de golpe
    mostrarPantallaTemporal();
}

function mostrarPantallaTemporal() {
    const modal = document.getElementById('modal-exito');
    
    // Si por alguna razón no encuentra el modal en el HTML, avisa en consola
    if (!modal) {
        console.error("No se encontró el elemento con id 'modal-exito' en el HTML.");
        window.location.href = "iniciosesion.html"; // Redirección de emergencia
        return;
    }
    
    // Mostramos la pantalla temporal
    modal.classList.add('modal-visible');
    
    // Esperamos 3 segundos, cerramos el modal y mandamos a iniciar sesión
    setTimeout(() => {
        modal.classList.remove('modal-visible');
        window.location.href = "iniciosesion.html"; 
    }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

    if (form) {
        form.addEventListener("submit", function(e) {
            registrar(form, e);
        });
    }
});