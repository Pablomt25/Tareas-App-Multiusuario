<script setup>
import { ref } from 'vue';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { signOut } from 'firebase/auth';

const auth = getAuth();
const usuario = ref(null);
const errorInicioSesion = ref(null);
const correo = ref('');
const contrasena = ref('');
const mostrarFormularioRegistro = ref(false);

function iniciaSesionGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = signInWithPopup(auth, provider);
    const user = result.user;
    usuario.value = user.displayName;
    router.push('/privada');
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error.message);
  }
}

function iniciaSesionFacebook() {
  const provider2 = new FacebookAuthProvider();
  signInWithPopup(auth, provider2)
    .then((result) => {
      const user = result.user;
      usuario.value = user.displayName;
    })
    .catch((error) => {
      console.error('Error al iniciar sesión con Facebook:', error.message);
    });
}

function iniciaSesionEmailPassword() {
  signInWithEmailAndPassword(auth, correo.value, contrasena.value)
    .then((userCredential) => {
      const user = userCredential.user;
      usuario.value = user.displayName;
      errorInicioSesion.value = null;
    })
    .catch((error) => {
      console.error('Error al iniciar sesión con correo y contraseña:', error.message);
      errorInicioSesion.value = error.message;
    });
}

function registraUsuario() {
  createUserWithEmailAndPassword(auth, correo.value, contrasena.value)
    .then((userCredential) => {
      const user = userCredential.user;
      usuario.value = user.displayName;
      errorInicioSesion.value = null; 
      console.log('Usuario registrado con éxito!');
      mostrarFormularioRegistro.value = false; 
    })
    .catch((error) => {
      console.error('Error al registrar usuario:', error.message);
      errorInicioSesion.value = error.message;
    });
}

function cerrarSesion() {
  signOut(auth)
    .then(() => {
      usuario.value = null;
    })
    .catch((error) => {
      console.error('Error al cerrar sesión:', error.message);
    });
}
</script>

<template>
  <div class="container">
    <p v-if="usuario" class="welcome-message">¡Bienvenido, {{ usuario }}!</p>

    <p v-if="errorInicioSesion" class="error-message">{{ errorInicioSesion }}</p>

    <button @click="mostrarFormularioRegistro = true" class="register-button">Registrarse</button>

    
    <form v-if="mostrarFormularioRegistro" @submit.prevent="registraUsuario" class="auth-form">
      <h2>Registro</h2>
      <label for="regEmail">Correo Electrónico:</label>
      <input type="email" id="regEmail" v-model="correo" required>

      <label for="regPassword">Contraseña:</label>
      <input type="password" id="regPassword" v-model="contrasena" required>

      <button type="submit" class="submit-button">Registrarse</button>
    </form>

    <form @submit.prevent="iniciaSesionEmailPassword" class="auth-form">
      <h2>Iniciar Sesión</h2>
      <label for="email">Correo Electrónico:</label>
      <input type="email" id="email" v-model="correo" required>

      <label for="password">Contraseña:</label>
      <input type="password" id="password" v-model="contrasena" required>

      <button type="submit" class="submit-button">Iniciar Sesión</button>
    </form>

    <div class="social-buttons">
      <button @click="iniciaSesionGoogle" class="social-button google-button">
        <img src="../assets/google.jpg" alt=""> Iniciar con Google
      </button>
      <button @click="iniciaSesionFacebook" class="social-button facebook-button">
        <img src="../assets/facebook.png" alt=""> Iniciar con Facebook
      </button>
    </div>
    <button @click="cerrarSesion" class="logout-button">Cerrar sesión</button>
  </div>
</template>

