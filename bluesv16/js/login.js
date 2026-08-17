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

function obtenerDatosDelFormulario(form) {
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');

    return {
        email: emailInput ? emailInput.value.trim() : '',
        password: passwordInput ? passwordInput.value : ''
    };
}

function iniciarSesion(form, event) {
    event.preventDefault();

    const { email, password } = obtenerDatosDelFormulario(form);

    if (!email || !password) {
        mostrarMensaje('Completa todos los campos', 'error');
        return;
    }

    const usuarios = obtenerUsuarios();

    const usuarioEncontrado = usuarios.find(
        u => u.usuario.toLowerCase() === email.toLowerCase()
    );

    if (!usuarioEncontrado || usuarioEncontrado.clave !== password) {
        mostrarMensaje('Correo o contraseña incorrectos', 'error');
        return;
    }

    mostrarMensaje('Inicio de sesión correcto');
    window.location.href = "home.html";
    form.reset();

    // window.location.href = "inicio.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    if (form) {
        form.addEventListener("submit", function(e) {
            iniciarSesion(form, e);
        });
    }
});