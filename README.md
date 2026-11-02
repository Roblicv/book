# El problema de los dos cuerpos

Libro en formato web. Todos los archivos van juntos en la raíz del repositorio.

| Archivo | Qué es |
|---|---|
| `index.html` | Portada con el título y el índice de capítulos |
| `capitulo-1.html` | Capítulo I: La anomalía del potasio y el hierro |
| `capitulo-2.html` | Capítulo II: La divergencia de Lorenz |
| `styles.css` | Diseño compartido por todo el libro |
| `libro.js` | Comportamiento compartido (notas, etiquetas de quién habla, tamaño de texto) |
| `capitulo-1.js` | Recuadros K y Fe, contador hacia el Nobel |
| `capitulo-2.js`, `capitulo-2.css` | Línea temporal con decisiones en espiral |
| `indice.js`, `indice.css` | Índice (capítulos bloqueados) |

## Actualizar en GitHub
1. Sube los archivos modificados a la raíz (Add file > Upload files). Los que tienen el mismo nombre reemplazan a los anteriores.
2. Borra `script.js`, que ya no se usa.

## Agregar un capítulo nuevo
Se copia `capitulo-2.html`, se cambia el texto y se enlaza desde `index.html` quitando el bloqueo de la fila correspondiente.
