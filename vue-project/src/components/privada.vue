<script setup>
import { ref, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { useFirestore } from 'vuefire';
import { collection, addDoc, deleteDoc, updateDoc, query, where, getDocs, doc } from 'firebase/firestore';
import { useCollection } from 'vuefire';
import { uploadBytes, getDownloadURL } from 'firebase/storage';
import '../assets/main2.css';

const auth = getAuth();
const user = auth.currentUser;
const db = useFirestore();
const notas = useCollection(collection(db, 'notas'));
const contadorNotas = ref(0);

const cargarNotas = async () => {  //Se ejecuta cuando el componente está montado
  if (user) {
    const notasCollection = collection(db, 'notas');
    const q = query(notasCollection, where('uid', '==', user.uid)); //consulta para obtener solo las notas asociadas al usuario actual
    const resultados = await getDocs(q); //Contiene los resultados

    notas.value = resultados.docs.map((doc) => ({ id: doc.id, ...doc.data() })); //Mapea los documentos en la colección a un array de objetos que incluyen el ID del documento y los datos del documento. Este array se asigna a notas.value.
    contadorNotas.value = notas.value.length;  // Establece el valor de contadorNotas en la longitud del array de notas, que representa el número de notas.
  }
};
onMounted(cargarNotas);

const obtenerNombreArchivo = (url) => {
  const partesUrl = url.split('/');
  return partesUrl[partesUrl.length - 1];
};

let contenidoNota = ref('');

function agregarNota() {
  if (user) {
    const notasCollection = collection(db, 'notas');
    addDoc(notasCollection, { uid: user.uid, texto: contenidoNota.value, prioridad: 'baja', adjunto: '' })
      .then(() => {
        contenidoNota.value = '';
      })
      .catch(error => {
        console.error('Error al agregar nota:', error.message);
      });
  }
}

function eliminarNota(id) {
  if (user) {
    const notasCollection = collection(db, 'notas');
    console.log('Eliminando nota con ID:', id);
    deleteDoc(doc(notasCollection, id));
  }
}

function actualizarPrioridadNota(id, nuevaPrioridad) {
  if (user) {
    const notasCollection = collection(db, 'notas');
    console.log('Actualizando prioridad de nota con ID:', id, 'a:', nuevaPrioridad);
    updateDoc(doc(notasCollection, id), { prioridad: nuevaPrioridad });
  }
}

function subirAdjunto(e, id) {
  const file = e.target.files[0];
  if (user) {
    const storageRef = storageRef(storage, file.name);

    uploadBytes(storageRef, file).then(snapshot => {
      return getDownloadURL(snapshot.ref);
    }).then(DownloadURL => {
      console.log('URL de descarga', DownloadURL);
      const notasCollection = collection(db, 'notas');
      updateDoc(doc(notasCollection, id), { adjunto: DownloadURL });
    });
  }
}

</script>

<template>
  <div>
    <input type="text" v-model="contenidoNota">

    <label for="subirArchivo">Adjuntar Archivo</label>
    <input type="file" id="subirArchivo" multiple @change="subirAdjunto">

    <button @click="agregarNota">Nueva nota</button>
    <div>Numero de notas: {{ contadorNotas }}</div>
    <ul>
      <li v-for="nota in notas" :key="nota.id">
        <span>{{ nota.texto }} - {{ nota.prioridad }} - <a :href="nota.adjunto" target="_blank">{{
          obtenerNombreArchivo(nota.adjunto) }}</a></span>
        <button @click="eliminarNota(nota.id)">Eliminar</button>
        <button @click="actualizarPrioridadNota(nota.id, 'alta')">Subir prioridad</button>
      </li>
    </ul>
  </div>
</template>


