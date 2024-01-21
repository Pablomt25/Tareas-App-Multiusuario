import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import { VueFire, VueFireAuth } from 'vuefire';
import { firebaseApp } from './firebase';

import privada from './components/privada.vue';
import inicio from './components/inicio.vue';
import administrador from './components/administrador.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const routes = [
  { path: '/', component: inicio },
  { path: '/privada', component: privada },
  { path: '/administrador', component: administrador },
  { path: '/', component: inicio }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let estasIdentificado = false;
let esAdministrador = false; // Variable para verificar si el usuario es administrador

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    console.log('Se ha iniciado sesión');
    estasIdentificado = true;
    esAdministrador = user.email === 'administrador@gmail.com'; // Verifica si el usuario es administrador

    // Redirigir a la página de área privada
    router.push('/privada');
  } else {
    console.log('Se ha cerrado sesión');
    estasIdentificado = false;
    esAdministrador = false;
  }
});

router.beforeEach((to, from, next) => {
  if (to.path === '/privada' && !estasIdentificado) {
    next('/');
  } else if (to.path === '/administrador' && (!estasIdentificado || !esAdministrador)) {
    next('/');
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

app.mount('#app');
