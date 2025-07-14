document.addEventListener('DOMContentLoaded', () => {
  // Obtener nombre de usuario
  let usuario = localStorage.getItem('usuarioActual');
  if (!usuario) {
    usuario = prompt("Ingresa tu nombre para guardar tu progreso:");
    if (!usuario) usuario = "invitado";
    localStorage.setItem('usuarioActual', usuario);
  }

  const keyStorage = `estadoCursos_${usuario}`;
  const cursos = document.querySelectorAll('.curso');
  const estado = JSON.parse(localStorage.getItem(keyStorage)) || {};

  const desbloqueaMap = {};
  const requisitosMap = {};

  // Construir mapas de relaciones
  cursos.forEach(curso => {
    const id = curso.id;
    const desbloquea = curso.dataset.desbloquea?.split(',').map(e => e.trim()).filter(Boolean) || [];
    desbloqueaMap[id] = desbloquea;

    desbloquea.forEach(destino => {
      if (!requisitosMap[destino]) requisitosMap[destino] = [];
      requisitosMap[destino].push(id);
    });
  });

  // Aplicar estado guardado
  cursos.forEach(curso => {
    const id = curso.id;
    if (estado[id]) {
      curso.classList.add('tachado');
    }
  });

  function actualizarBloqueos() {
    cursos.forEach(curso => {
      const id = curso.id;
      const prerequisitos = requisitosMap[id] || [];

      if (prerequisitos.length === 0) {
        curso.classList.remove('bloqueado');
        curso.style.pointerEvents = 'auto';
        curso.style.opacity = '1';
        return;
      }

      const habilitado = prerequisitos.every(req => estado[req]);

      if (habilitado) {
        curso.classList.remove('bloqueado');
        curso.style.pointerEvents = 'auto';
        curso.style.opacity = '1';
      } else {
        if (estado[id]) {
          estado[id] = false;
          curso.classList.remove('tachado');
        }
        curso.classList.add('bloqueado');
        curso.style.pointerEvents = 'none';
        curso.style.opacity = '0.5';
      }
    });

    localStorage.setItem(keyStorage, JSON.stringify(estado));
  }

  cursos.forEach(curso => {
    curso.addEventListener('click', () => {
      const id = curso.id;

      if (curso.classList.contains('bloqueado')) return;

      // Toggle tachado
      const estabaTachado = curso.classList.toggle('tachado');
      estado[id] = estabaTachado;

      actualizarBloqueos();
    });
  });

  actualizarBloqueos();
});
